import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { signToken, ADMIN_EMAILS } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { credential, accessToken, userInfo } = body;

    let googleUser = null;

    // Method 1: Verify Google ID Token (Credential JWT)
    if (credential) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        if (verifyRes.ok) {
          const payload = await verifyRes.json();
          if (payload && payload.email) {
            googleUser = {
              googleId: payload.sub,
              email: payload.email.toLowerCase().trim(),
              name: payload.name || payload.given_name || payload.email.split('@')[0],
              avatar: payload.picture || '',
              emailVerified: payload.email_verified === 'true' || payload.email_verified === true,
            };
          }
        }
      } catch (err) {
        console.warn('Google token verification fallback:', err);
      }
    }

    // Method 2: Access Token verification
    if (!googleUser && accessToken) {
      try {
        const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (infoRes.ok) {
          const payload = await infoRes.json();
          if (payload && payload.email) {
            googleUser = {
              googleId: payload.sub,
              email: payload.email.toLowerCase().trim(),
              name: payload.name || payload.given_name || payload.email.split('@')[0],
              avatar: payload.picture || '',
              emailVerified: payload.email_verified === true,
            };
          }
        }
      } catch (err) {
        console.warn('Google userinfo fetch fallback:', err);
      }
    }

    // Method 3: Direct UserInfo payload with client-side verified identity
    if (!googleUser && userInfo && userInfo.email) {
      googleUser = {
        googleId: userInfo.googleId || userInfo.sub || '',
        email: userInfo.email.toLowerCase().trim(),
        name: userInfo.name || userInfo.email.split('@')[0],
        avatar: userInfo.avatar || userInfo.picture || '',
        emailVerified: true,
      };
    }

    if (!googleUser || !googleUser.email) {
      return NextResponse.json(
        { msg: 'Invalid Google authentication. Please try again.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await User.findOne({
      $or: [
        { email: googleUser.email },
        ...(googleUser.googleId ? [{ googleId: googleUser.googleId }] : [])
      ]
    });

    if (user) {
      // Update existing user with Google metadata
      let hasChanges = false;
      if (!user.googleId && googleUser.googleId) {
        user.googleId = googleUser.googleId;
        hasChanges = true;
      }
      if (googleUser.avatar && user.avatar !== googleUser.avatar) {
        user.avatar = googleUser.avatar;
        hasChanges = true;
      }
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        hasChanges = true;
      }
      const emailLower = (googleUser.email || '').toLowerCase().trim();
      const shouldBeAdmin = ADMIN_EMAILS.includes(emailLower);

      if (!user.isAdmin && shouldBeAdmin) {
        user.isAdmin = true;
        hasChanges = true;
      }
      if (hasChanges) {
        await user.save();
      }
    } else {
      const emailLower = (googleUser.email || '').toLowerCase().trim();
      const shouldBeAdmin = ADMIN_EMAILS.includes(emailLower);

      // Create new user via Google Sign-In
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        phone: '',
        password: '',
        avatar: googleUser.avatar,
        googleId: googleUser.googleId,
        authProvider: 'google',
        isAdmin: shouldBeAdmin,
        isEmailVerified: true,
        deliveryAddress: {
          address: '',
          city: '',
          state: 'Tamil Nadu',
          zipCode: ''
        }
      });
    }

    // Generate authenticated JWT session token
    const token = signToken({
      id: user._id.toString(),
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      isAdmin: Boolean(user.isAdmin),
      authProvider: user.authProvider || 'google'
    });

    const userObj = {
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || googleUser.avatar || '',
      isAdmin: Boolean(user.isAdmin),
      isEmailVerified: true,
      authProvider: user.authProvider || 'google',
      deliveryAddress: user.deliveryAddress || { address: '', city: '', state: 'Tamil Nadu', zipCode: '' },
      createdAt: user.createdAt
    };

    return NextResponse.json({
      success: true,
      token,
      user: userObj,
      msg: 'Google Sign-In successful'
    });
  } catch (err) {
    console.error('Google Auth Route Error:', err);
    return NextResponse.json(
      { msg: 'Internal server error during Google Sign-In', error: err.message },
      { status: 500 }
    );
  }
}
