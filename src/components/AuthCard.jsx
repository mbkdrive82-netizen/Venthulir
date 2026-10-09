'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ArrowLeft,
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import '../app/login/AuthPages.css';

export default function AuthCard({ initialMode = 'login' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/profile';

  // Modes: 'login' | 'register'
  const [mode, setMode] = useState(initialMode === 'register' ? 'register' : 'login');
  const { login, register } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: 'Tamil Nadu',
    zipCode: ''
  });
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Shared state
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleTabSwitch = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setError('');
    setSuccessMsg('');
    if (typeof window !== 'undefined') {
      const targetPath = newMode === 'register' ? '/register' : '/login';
      const newPath = `${targetPath}${redirect !== '/profile' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`;
      window.history.replaceState(null, '', newPath);
    }
  };

  // Google OAuth Success Handler
  const handleGoogleSuccess = (user) => {
    setError('');
    setSuccessMsg(`Welcome to Venthulir, ${user?.name || 'Customer'}! Redirecting...`);
    const isAdmin = Boolean(user?.isAdmin || user?.role === 'admin' || user?.email?.toLowerCase() === 'admin@venthulir.com');
    setTimeout(() => {
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push(redirect === '/admin' ? '/admin' : redirect);
      }
    }, 600);
  };

  // Direct Password Login (Instant Sign-In)
  const handleDirectPasswordLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Please enter both email/username and password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await login(loginEmail.trim(), loginPassword);
      if (res.success) {
        setSuccessMsg('Signed in successfully! Redirecting...');
        const isAdmin = Boolean(res.user?.isAdmin || res.user?.role === 'admin' || loginEmail.trim().toLowerCase() === 'admin' || loginEmail.trim().toLowerCase() === 'admin@venthulir.com');
        setTimeout(() => {
          if (isAdmin) {
            router.push('/admin');
          } else {
            router.push(redirect === '/admin' ? '/admin' : redirect);
          }
        }, 500);
      } else {
        setError(res.msg || 'Invalid credentials. Please check your username/password.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Direct Standard Registration (Instant Account Creation)
  const handleDirectRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regData.name.trim() || !regData.email.trim() || !regData.phone.trim() || !regData.password) {
      setError('Please fill in all mandatory fields (Name, Email, Phone, Password).');
      return;
    }

    if (regData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (regData.password !== regData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to terms & conditions to proceed.');
      return;
    }

    setLoading(true);

    try {
      const regRes = await register(
        regData.name.trim(),
        regData.email.toLowerCase().trim(),
        regData.phone.trim(),
        regData.password,
        regData.address.trim(),
        regData.city.trim(),
        regData.state.trim() || 'Tamil Nadu',
        regData.zipCode.trim()
      );

      if (regRes.success) {
        setSuccessMsg('🎉 Account created successfully! Welcome to Venthulir.');
        setTimeout(() => {
          router.push(redirect);
        }, 700);
      } else {
        setError(regRes.msg || 'Registration failed. Email may already be registered.');
      }
    } catch {
      setError('Something went wrong during account creation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="luxury-auth-viewport">
      <div className="luxury-auth-card">
        
        <div className="luxury-panel-top">
          <Link href="/home" className="back-to-store-link">
            <ArrowLeft size={14} /> <span>Return to Store</span>
          </Link>
          <div className="ssl-secure-badge">
            <Lock size={12} /> <span>256-Bit SSL Secure</span>
          </div>
        </div>

        {/* Brand Logo & Name */}
        <div className="luxury-brand-header">
          <img src="/logo.png" alt="Venthulir Logo" className="luxury-brand-logo" />
          <span className="brand-title">VENTHULIR</span>
          <span className="brand-subtitle">100% PURE ORGANIC HARVEST</span>
        </div>

        <h1 className="luxury-page-heading">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="luxury-page-subheading">
          {mode === 'login' 
            ? 'Sign in to access member pricing, live orders & addresses.' 
            : 'Join South Indian families enjoying pure farm-direct organic harvest.'}
        </p>

        {/* Switch Tabs */}
        <div className="luxury-tab-toggle">
          <button 
            type="button" 
            className={`luxury-tab-btn ${mode === 'login' ? 'active' : ''}`} 
            onClick={() => handleTabSwitch('login')}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`luxury-tab-btn ${mode === 'register' ? 'active' : ''}`} 
            onClick={() => handleTabSwitch('register')}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && <div className="luxury-alert error"><AlertCircle size={16} /> <span>{error}</span></div>}
        {successMsg && <div className="luxury-alert success"><CheckCircle2 size={16} /> <span>{successMsg}</span></div>}

        {/* ── 1. GOOGLE OAUTH 2.0 BUTTON ── */}
        <div className="luxury-google-section">
          <GoogleAuthButton 
            onSuccess={handleGoogleSuccess}
            onError={(msg) => setError(msg)}
            buttonText={mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
          />
        </div>

        <div className="auth-social-divider">
          <span>{mode === 'login' ? 'or sign in with email' : 'or register with email'}</span>
        </div>

        {/* ── 2. SIGN IN WITH PASSWORD FORM ── */}
        {mode === 'login' && (
          <form onSubmit={handleDirectPasswordLogin} className="luxury-form">
            <div className="luxury-field-group">
              <label htmlFor="login-email">Email or Username</label>
              <div className="luxury-input-wrapper">
                <Mail size={16} className="luxury-input-icon" />
                <input 
                  id="login-email"
                  type="text" 
                  placeholder="you@email.com or username" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required 
                  autoFocus
                />
              </div>
            </div>

            <div className="luxury-field-group">
              <label htmlFor="login-password">
                <span>Password</span>
                <Link href="/forgot-password" className="forgot-link">Forgot Password?</Link>
              </label>
              <div className="luxury-input-wrapper">
                <Lock size={16} className="luxury-input-icon" />
                <input 
                  id="login-password"
                  type={showPass ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required 
                />
                <button type="button" className="luxury-pass-toggle" onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <label className="luxury-checkbox-row">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <span>Keep me signed in on this device</span>
            </label>

            <button type="submit" className="luxury-btn-primary" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin-icon" /> : (
                <>
                  <span>Sign In with Password</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* ── 3. DIRECT REGISTRATION FORM ── */}
        {mode === 'register' && (
          <form onSubmit={handleDirectRegister} className="luxury-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="luxury-field-group">
                <label>Full Name *</label>
                <div className="luxury-input-wrapper">
                  <User size={15} className="luxury-input-icon" />
                  <input type="text" placeholder="e.g. Maya Raman" value={regData.name} onChange={(e) => setRegData(p => ({ ...p, name: e.target.value }))} required />
                </div>
              </div>
              <div className="luxury-field-group">
                <label>Phone Number *</label>
                <div className="luxury-input-wrapper">
                  <Phone size={15} className="luxury-input-icon" />
                  <input type="tel" placeholder="+91 98765 43210" value={regData.phone} onChange={(e) => setRegData(p => ({ ...p, phone: e.target.value }))} required />
                </div>
              </div>
            </div>

            <div className="luxury-field-group">
              <label>Email Address *</label>
              <div className="luxury-input-wrapper">
                <Mail size={15} className="luxury-input-icon" />
                <input type="email" placeholder="you@email.com" value={regData.email} onChange={(e) => setRegData(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="luxury-field-group">
                <label>Set Password *</label>
                <div className="luxury-input-wrapper">
                  <Lock size={15} className="luxury-input-icon" />
                  <input type={showPass ? 'text' : 'password'} placeholder="Min 6 chars" value={regData.password} onChange={(e) => setRegData(p => ({ ...p, password: e.target.value }))} required />
                  <button type="button" className="luxury-pass-toggle" onClick={() => setShowPass(v => !v)}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="luxury-field-group">
                <label>Confirm *</label>
                <div className="luxury-input-wrapper">
                  <Lock size={15} className="luxury-input-icon" />
                  <input type={showPass ? 'text' : 'password'} placeholder="Re-enter password" value={regData.confirmPassword} onChange={(e) => setRegData(p => ({ ...p, confirmPassword: e.target.value }))} required />
                </div>
              </div>
            </div>

            <label className="luxury-checkbox-row">
              <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
              <span>I agree to Venthulir&apos;s Terms of Service & Privacy Policy</span>
            </label>

            <button type="submit" className="luxury-btn-primary" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin-icon" /> : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

      </div>

      {/* Trust Badges Below Card */}
      <div className="luxury-trust-footer">
        <span className="trust-item">🌾 100% Farm-Direct</span>
        <span className="trust-item">•</span>
        <span className="trust-item">🪵 Traditional Wood-Pressed</span>
        <span className="trust-item">•</span>
        <span className="trust-item">🔒 100% Secure Checkout</span>
      </div>
    </div>
  );
}
