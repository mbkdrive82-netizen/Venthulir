'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

// Safe JWT decode helper for Google ID token
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export default function GoogleAuthButton({
  onSuccess,
  onError,
  buttonText = 'Continue with Google',
  className = '',
  mode = 'signin',
}) {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);
  const googleBtnContainerRef = useRef(null);

  // Client ID from environment or fallback
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '101897658453-2cp2tca8pk51iq5grrs7dh3e6s5i9pmd.apps.googleusercontent.com';

  useEffect(() => {
    // Load Google Identity Services Script dynamically if not present
    if (typeof window === 'undefined') return;

    const existingScript = document.getElementById('google-gsi-client');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGsiReady(true);
      };
      document.body.appendChild(script);
    } else {
      setGsiReady(true);
    }
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      setLoading(true);
      const credential = response.credential;
      const decoded = parseJwt(credential);

      const res = await loginWithGoogle({
        credential,
        userInfo: decoded
          ? {
              email: decoded.email,
              name: decoded.name || decoded.given_name,
              avatar: decoded.picture,
              googleId: decoded.sub,
            }
          : null,
      });

      if (res.success) {
        toast.success(`Welcome to Venthulir, ${res.user?.name || 'Customer'}!`);
        if (onSuccess) onSuccess(res.user);
      } else {
        const errorMsg = res.msg || 'Google Sign-In failed';
        toast.error(errorMsg);
        if (onError) onError(errorMsg);
      }
    } catch (err) {
      console.error('Google Auth Error:', err);
      toast.error('Unable to complete Google Sign-In');
      if (onError) onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (loading) return;

    if (window.google?.accounts?.oauth2) {
      try {
        setLoading(true);
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setLoading(false);
              return;
            }
            if (tokenResponse.access_token) {
              try {
                // Fetch profile directly from Google
                const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = userRes.ok ? await userRes.json() : null;

                const res = await loginWithGoogle({
                  accessToken: tokenResponse.access_token,
                  userInfo: userInfo
                    ? {
                        email: userInfo.email,
                        name: userInfo.name || userInfo.given_name,
                        avatar: userInfo.picture,
                        googleId: userInfo.sub,
                      }
                    : null,
                });

                if (res.success) {
                  toast.success(`Welcome to Venthulir, ${res.user?.name || 'Customer'}!`);
                  if (onSuccess) onSuccess(res.user);
                } else {
                  const errorMsg = res.msg || 'Google Sign-In failed';
                  toast.error(errorMsg);
                  if (onError) onError(errorMsg);
                }
              } catch (err) {
                console.error('Google profile fetch error:', err);
                toast.error('Could not complete Google authentication.');
              }
            }
            setLoading(false);
          },
          error_callback: (err) => {
            console.warn('Google OAuth popup error:', err);
            setLoading(false);
          },
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        console.warn('Google GIS Error:', err);
        setLoading(false);
      }
    } else {
      toast.info('Google Authentication service is loading, please try again in a moment...');
    }
  };

  return (
    <div className="google-auth-wrapper" style={{ width: '100%', position: 'relative' }}>
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className={`btn-google-auth ${className}`}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '12px 18px',
          backgroundColor: '#FFFFFF',
          color: '#1F2937',
          border: '1.5px solid #E5E7EB',
          borderRadius: '12px',
          fontSize: '0.94rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#F9FAFB';
          e.currentTarget.style.borderColor = '#D1D5DB';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
          e.currentTarget.style.borderColor = '#E5E7EB';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.04)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin text-emerald-700" style={{ color: '#1B5E2F' }} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span>{loading ? 'Signing in with Google...' : buttonText}</span>
      </button>

      {/* Hidden container for official Google rendered button if needed */}
      <div ref={googleBtnContainerRef} style={{ display: 'none' }} />
    </div>
  );
}
