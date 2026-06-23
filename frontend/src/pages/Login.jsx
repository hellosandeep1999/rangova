import React, { useState, useEffect } from 'react';
import { supabase, checkCustomerExists } from '../lib/api';

// Steps: 'login' | 'forgot' | 'reset-password'
//        'register-email' | 'otp' | 'register-details'

export default function Login({ navigateTo, triggerNotification, setCurrentUser }) {
  const [tab, setTab] = useState('login');

  // ── Login State ──────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  // ── Signup State ─────────────────────────────────────
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [regFName, setRegFName] = useState('');
  const [regLName, setRegLName] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // ── Forgot Password State ────────────────────────────
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const [loading, setLoading] = useState(false);

  // ── Check URL hash for password reset flow ───────────
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('access_token')) {
      setTab('reset-password');
      // Clean the hash so it doesn't interfere
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // ── OTP countdown ────────────────────────────────────
  useEffect(() => {
    let interval;
    if (tab === 'otp' && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [tab, otpTimer]);

  // ── HANDLERS ─────────────────────────────────────────

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;

      const { user } = data;
      // Check if customer record exists; if not, route to complete signup
      const exists = await checkCustomerExists(user.email);
      if (!exists) {
        // Sync them now
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        await fetch(`${apiUrl}/api/customers/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user.user_metadata?.first_name
              ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
              : user.email.split('@')[0],
            email: user.email,
            phone: user.user_metadata?.phone || ''
          })
        }).catch(() => {});
      }

      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('email', user.email)
        .single();

      if (customerData?.status === 'blocked') {
        await supabase.auth.signOut();
        throw new Error('Your account has been blocked. Please contact support.');
      }

      setCurrentUser({
        ...user,
        name: user.user_metadata?.first_name
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
          : user.email.split('@')[0],
        phone: customerData?.phone || user.user_metadata?.phone || '',
        customerId: customerData?.id || null,
      });
      triggerNotification('Signed in successfully. Welcome back to Rangova!');
      navigateTo('home');
    } catch (err) {
      triggerNotification(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Check email + send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!regEmail || !regPassword) return;
    if (regPassword.length < 8) {
      triggerNotification('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      // Check duplicate
      const exists = await checkCustomerExists(regEmail);
      if (exists) {
        triggerNotification('An account with this email already exists. Please sign in.');
        setTab('login');
        setLoginEmail(regEmail);
        setLoading(false);
        return;
      }
      // Also check Supabase Auth for existing user
      const { error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: { emailRedirectTo: undefined }
      });
      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          triggerNotification('An account with this email already exists. Please sign in.');
          setTab('login');
          setLoginEmail(regEmail);
          return;
        }
        throw error;
      }
      setTab('otp');
      setOtpTimer(60);
      triggerNotification('OTP sent to your email. Please check your inbox.');
    } catch (err) {
      triggerNotification(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: regEmail,
        token: otpCode,
        type: 'signup'
      });
      if (error) throw error;
      // OTP verified — proceed to details
      setTab('register-details');
      triggerNotification('Email verified! Please complete your profile.');
    } catch (err) {
      triggerNotification(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete registration details
  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(regPhone)) {
      triggerNotification('Mobile number must be exactly 10 digits.');
      return;
    }
    setLoading(true);
    try {
      const fullName = `${regFName} ${regLName}`.trim();

      // Update Supabase auth metadata
      await supabase.auth.updateUser({
        data: { first_name: regFName, last_name: regLName, phone: regPhone }
      });

      // Sync to customers table
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      await fetch(`${apiUrl}/api/customers/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email: regEmail, phone: regPhone })
      }).catch(console.error);

      // Get the current session user
      const { data: { user } } = await supabase.auth.getUser();
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('email', regEmail)
        .single();

      setCurrentUser({
        ...user,
        name: fullName,
        phone: regPhone,
        customerId: customerData?.id || null,
      });

      triggerNotification('Account created successfully! Welcome to Rangova.');
      navigateTo('home');
    } catch (err) {
      triggerNotification(err.message || 'Failed to complete signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: regEmail });
      if (error) throw error;
      setOtpTimer(60);
      triggerNotification('OTP resent successfully.');
    } catch (err) {
      triggerNotification(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Forgot password — send reset link
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/login`
      });
      if (error) throw error;
      setForgotSent(true);
      triggerNotification('Password reset link sent! Check your email.');
    } catch (err) {
      triggerNotification(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  // Reset password (after clicking email link)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirm) {
      triggerNotification('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      triggerNotification('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      triggerNotification('Password updated successfully! Please sign in.');
      setTab('login');
    } catch (err) {
      triggerNotification(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  // ── RENDER ────────────────────────────────────────────
  const isOtpFlow = tab === 'otp' || tab === 'register-details';
  const isAuthFlow = tab !== 'forgot' && tab !== 'reset-password';

  return (
    <div className="w-full min-h-[90vh] flex flex-col md:flex-row text-left">
      {/* Left decorative panel */}
      <div className="w-full md:w-1/2 relative bg-primary hidden md:block overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-black/10" />
        <button
          onClick={() => navigateTo('home')}
          className="absolute top-10 left-10 font-headline-lg text-white font-bold text-2xl tracking-tighter hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer"
        >
          RANGOVA
        </button>
        <div className="absolute bottom-16 left-12 right-12 text-white">
          <h2 className="font-headline-xl text-[40px] text-white font-bold leading-tight mb-4 drop-shadow-sm">
            {tab === 'forgot' || tab === 'reset-password' ? 'Restore Access.' : 'Crafted Heritage.'}
          </h2>
          <p className="font-body-lg text-base text-white/90 max-w-sm drop-shadow-sm leading-relaxed">
            {tab === 'forgot' || tab === 'reset-password'
              ? 'We\'ll send a secure link to reset your password.'
              : 'Join our curated community to access exclusive collections, early arrivals, and bespoke editorial content.'}
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full md:w-1/2 bg-warm-ivory flex flex-col justify-center items-center px-6 md:px-16 py-12">
        <div className="w-full max-w-md">

          {/* ── Tab switcher (login / register-email) ── */}
          {(tab === 'login' || tab === 'register-email') && (
            <div className="flex gap-8 mb-10 border-b border-outline-variant/30 pb-3 relative">
              <button
                onClick={() => setTab('login')}
                className={`font-label-caps text-label-caps transition-colors duration-300 pb-2 relative bg-transparent border-none cursor-pointer ${tab === 'login' ? 'text-primary font-bold' : 'text-secondary hover:text-primary'}`}
              >
                SIGN IN
                {tab === 'login' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
              </button>
              <button
                onClick={() => setTab('register-email')}
                className={`font-label-caps text-label-caps transition-colors duration-300 pb-2 relative bg-transparent border-none cursor-pointer ${tab === 'register-email' ? 'text-primary font-bold' : 'text-secondary hover:text-primary'}`}
              >
                CREATE ACCOUNT
                {tab === 'register-email' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
              </button>
            </div>
          )}

          {/* ── Step header for OTP / details / forgot ── */}
          {tab === 'otp' && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <button onClick={() => setTab('register-email')} className="text-secondary hover:text-primary bg-transparent border-none cursor-pointer">
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>
                <h3 className="font-display-lg text-2xl text-primary font-bold uppercase tracking-wide">Verify Email</h3>
              </div>
              <p className="text-sm text-secondary">Enter the 6-digit code sent to <strong>{regEmail}</strong></p>
              <div className="flex gap-2 mt-3">
                {['1','2','3'].map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 1 ? 'bg-primary text-white' : 'bg-outline-variant/30 text-secondary'}`}>{s}</div>
                    {i < 2 && <div className="w-6 h-px bg-outline-variant/30" />}
                  </div>
                ))}
                <span className="text-[10px] text-secondary ml-2 font-label-caps">Step 2 of 3</span>
              </div>
            </div>
          )}
          {tab === 'register-details' && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-primary text-white`}>3</div>
                <h3 className="font-display-lg text-2xl text-primary font-bold uppercase tracking-wide">Complete Profile</h3>
              </div>
              <p className="text-sm text-secondary">Almost done! Tell us a bit about yourself.</p>
            </div>
          )}
          {tab === 'forgot' && (
            <div className="mb-8">
              <button onClick={() => setTab('login')} className="flex items-center gap-2 text-secondary hover:text-primary text-sm mb-6 bg-transparent border-none cursor-pointer font-label-caps uppercase tracking-widest">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Sign In
              </button>
              <h3 className="font-display-lg text-2xl text-primary font-bold uppercase tracking-wide mb-2">Forgot Password</h3>
              <p className="text-sm text-secondary">Enter your email and we'll send you a reset link.</p>
            </div>
          )}
          {tab === 'reset-password' && (
            <div className="mb-8">
              <h3 className="font-display-lg text-2xl text-primary font-bold uppercase tracking-wide mb-2">Set New Password</h3>
              <p className="text-sm text-secondary">Create a new password for your Rangova account.</p>
            </div>
          )}

          {/* ── SIGN IN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-xs text-secondary font-bold">EMAIL ADDRESS</label>
                <input
                  type="email" required value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-3 text-sm font-body-md rounded-none text-primary"
                  placeholder="e.g. name@domain.com"
                />
              </div>
              <div className="flex flex-col gap-2 relative">
                <label className="font-label-caps text-xs text-secondary font-bold">PASSWORD</label>
                <div className="relative">
                  <input
                    type={showLoginPwd ? 'text' : 'password'} required value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-3 text-sm font-body-md rounded-none text-primary pr-10"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowLoginPwd(p => !p)} className="absolute right-0 top-1/2 -translate-y-1/2 text-secondary hover:text-primary bg-transparent border-none cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">{showLoginPwd ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <div className="text-right -mt-3">
                <button type="button" onClick={() => setTab('forgot')} className="text-xs text-secondary hover:text-primary underline bg-transparent border-none cursor-pointer font-label-caps uppercase tracking-wider">
                  Forgot Password?
                </button>
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 mt-2 hover:bg-secondary transition-all duration-300 border-none disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'SIGNING IN...' : 'SIGN IN'}
              </button>
              <p className="text-center text-xs text-secondary">
                Don't have an account?{' '}
                <button type="button" onClick={() => setTab('register-email')} className="text-primary underline bg-transparent border-none cursor-pointer font-bold">
                  Create one
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER STEP 1: Email + Password ── */}
          {tab === 'register-email' && (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-6">
              <div className="bg-surface-container-low border border-outline-variant/20 p-4 rounded-sm">
                <p className="text-xs text-secondary leading-relaxed">
                  <span className="material-symbols-outlined text-[14px] mr-1 text-muted-terracotta align-middle">info</span>
                  We'll send a verification code to your email before asking for your name and phone number.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-xs text-secondary font-bold">EMAIL ADDRESS</label>
                <input
                  type="email" required value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-3 text-sm font-body-md rounded-none text-primary"
                  placeholder="e.g. name@domain.com"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-xs text-secondary font-bold">PASSWORD</label>
                <div className="relative">
                  <input
                    type={showRegPwd ? 'text' : 'password'} required value={regPassword}
                    onChange={e => setRegPassword(e.target.value)} minLength={8}
                    className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-3 text-sm font-body-md rounded-none text-primary pr-10"
                    placeholder="Min. 8 characters"
                  />
                  <button type="button" onClick={() => setShowRegPwd(p => !p)} className="absolute right-0 top-1/2 -translate-y-1/2 text-secondary hover:text-primary bg-transparent border-none cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">{showRegPwd ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 mt-2 hover:bg-secondary transition-all duration-300 border-none disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'CHECKING...' : 'SEND VERIFICATION CODE'}
              </button>
              <p className="text-center text-xs text-secondary">
                Already have an account?{' '}
                <button type="button" onClick={() => setTab('login')} className="text-primary underline bg-transparent border-none cursor-pointer font-bold">
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER STEP 2: OTP ── */}
          {tab === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-xs text-secondary font-bold">ENTER 6-DIGIT OTP</label>
                <input
                  required type="text" pattern="\d{6}" maxLength="6"
                  value={otpCode} onChange={e => setOtpCode(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-3 text-center text-2xl tracking-[0.6em] font-mono rounded-none text-primary"
                  placeholder="• • • • • •"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 hover:bg-secondary transition-all duration-300 border-none disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'VERIFYING...' : 'VERIFY CODE'}
              </button>
              <div className="text-center">
                {otpTimer > 0 ? (
                  <p className="text-xs text-secondary">Resend code in <span className="font-bold text-primary">{otpTimer}s</span></p>
                ) : (
                  <button type="button" onClick={resendOtp} disabled={loading}
                    className="text-xs font-bold text-primary hover:text-muted-terracotta underline uppercase tracking-widest bg-transparent border-none cursor-pointer disabled:opacity-50">
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ── REGISTER STEP 3: Details ── */}
          {tab === 'register-details' && (
            <form onSubmit={handleCompleteSignup} className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-xs text-secondary font-bold">FIRST NAME</label>
                  <input required type="text" value={regFName} onChange={e => setRegFName(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-2 text-sm rounded-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-xs text-secondary font-bold">LAST NAME</label>
                  <input required type="text" value={regLName} onChange={e => setRegLName(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-2 text-sm rounded-none" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-xs text-secondary font-bold">MOBILE NUMBER</label>
                <input required type="tel" pattern="\d{10}" title="Please enter exactly 10 digits"
                  value={regPhone} onChange={e => setRegPhone(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-2 text-sm rounded-none"
                  placeholder="10-digit number" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-xs text-secondary font-bold">EMAIL (VERIFIED)</label>
                <input type="email" value={regEmail} disabled
                  className="w-full bg-transparent border-0 border-b border-outline/30 py-2 text-sm rounded-none text-secondary" />
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" required className="rounded-none mt-1 flex-shrink-0" />
                <span className="text-xs text-secondary leading-tight">I agree to the Privacy Policy and Terms of Service.</span>
              </label>
              <button
                type="submit" disabled={loading}
                className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 hover:bg-secondary transition-all duration-300 border-none disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'CREATING ACCOUNT...' : 'COMPLETE SIGNUP'}
              </button>
            </form>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-6">
              {forgotSent ? (
                <div className="flex flex-col items-center gap-4 py-6">
                  <span className="material-symbols-outlined text-5xl text-muted-terracotta">mark_email_read</span>
                  <p className="text-center text-sm text-secondary">
                    A password reset link has been sent to <strong className="text-primary">{forgotEmail}</strong>. Check your inbox and click the link to reset your password.
                  </p>
                  <button type="button" onClick={() => { setTab('login'); setForgotSent(false); }}
                    className="text-primary underline text-xs font-label-caps uppercase tracking-widest bg-transparent border-none cursor-pointer">
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-caps text-xs text-secondary font-bold">YOUR EMAIL ADDRESS</label>
                    <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-3 text-sm font-body-md rounded-none text-primary"
                      placeholder="e.g. name@domain.com" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 hover:bg-secondary transition-all duration-300 border-none disabled:opacity-50 cursor-pointer">
                    {loading ? 'SENDING...' : 'SEND RESET LINK'}
                  </button>
                </>
              )}
            </form>
          )}

          {/* ── RESET PASSWORD (from email link) ── */}
          {tab === 'reset-password' && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-xs text-secondary font-bold">NEW PASSWORD</label>
                <input type="password" required minLength={8} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-3 text-sm font-body-md rounded-none text-primary"
                  placeholder="Min. 8 characters" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-xs text-secondary font-bold">CONFIRM NEW PASSWORD</label>
                <input type="password" required minLength={8} value={newPasswordConfirm} onChange={e => setNewPasswordConfirm(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-3 text-sm font-body-md rounded-none text-primary"
                  placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 hover:bg-secondary transition-all duration-300 border-none disabled:opacity-50 cursor-pointer">
                {loading ? 'UPDATING...' : 'SET NEW PASSWORD'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
