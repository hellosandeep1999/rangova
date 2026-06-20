import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/api';

export default function Login({ navigateTo, triggerNotification, setCurrentUser }) {
  const [loginTab, setLoginTab] = useState('login'); // 'login', 'register', 'otp'
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register State
  const [regFName, setRegFName] = useState('');
  const [regLName, setRegLName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval;
    if (loginTab === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [loginTab, timer]);

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
      // Fetch customer record
      const { data: customerData } = await supabase.from('customers').select('*').eq('email', user.email).single();
      
      setCurrentUser({
        ...user,
        name: user.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}` : user.email.split('@')[0],
        phone: user.user_metadata?.phone || '',
        addresses: customerData?.addresses || []
      });
      triggerNotification("Signed in successfully. Welcome back to Rangova!");
      navigateTo('home');
    } catch (error) {
      triggerNotification(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(regPhone)) {
      triggerNotification("Mobile number must be exactly 10 digits");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            first_name: regFName,
            last_name: regLName,
            phone: regPhone
          }
        }
      });
      if (error) throw error;
      
      setLoginTab('otp');
      setTimer(60);
      triggerNotification("OTP sent to your email.");
    } catch (error) {
      triggerNotification(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: regEmail,
        token: otpCode,
        type: 'signup'
      });
      if (error) throw error;

      // Sync to customers table
      const fullName = `${regFName} ${regLName}`;
      await fetch('http://localhost:3001/api/customers/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email: regEmail, phone: regPhone })
      }).catch(console.error);

      setCurrentUser({
        ...data.user,
        name: fullName,
        phone: regPhone,
        addresses: []
      });

      triggerNotification("Account created and verified successfully!");
      navigateTo('home');
    } catch (error) {
      triggerNotification(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: regEmail,
      });
      if (error) throw error;
      setTimer(60);
      triggerNotification("OTP resent successfully.");
    } catch (error) {
      triggerNotification(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[90vh] flex flex-col md:flex-row text-left">
      <div className="w-full md:w-1/2 relative bg-surface-container-low hidden md:block overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-cover bg-center hover:scale-105 transition-transform duration-[8s] ease-in-out bg-primary"></div>
        <div className="absolute inset-0 bg-black/10" />
        <button 
          onClick={() => navigateTo('home')}
          className="absolute top-10 left-10 font-headline-lg text-white font-bold text-2xl tracking-tighter hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer"
        >
          RANGOVA
        </button>
        <div className="absolute bottom-16 left-12 right-12 text-white">
          <h2 className="font-headline-xl text-[40px] text-white font-bold leading-tight mb-4 drop-shadow-sm">Crafted Heritage.</h2>
          <p className="font-body-lg text-base text-white/90 max-w-sm drop-shadow-sm leading-relaxed">Join our curated community to access exclusive collections, early arrivals, and bespoke editorial content.</p>
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-warm-ivory flex flex-col justify-center items-center px-6 md:px-16 py-12">
        <div className="w-full max-w-md">
          {loginTab !== 'otp' && (
            <div className="flex gap-8 mb-10 border-b border-outline-variant/30 pb-3 relative">
              <button
                onClick={() => setLoginTab('login')}
                className={`font-label-caps text-label-caps transition-colors duration-300 pb-2 relative bg-transparent border-none cursor-pointer ${loginTab === 'login' ? 'text-primary font-bold' : 'text-secondary hover:text-primary'}`}
              >
                SIGN IN
                {loginTab === 'login' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
              </button>
              <button
                onClick={() => setLoginTab('register')}
                className={`font-label-caps text-label-caps transition-colors duration-300 pb-2 relative bg-transparent border-none cursor-pointer ${loginTab === 'register' ? 'text-primary font-bold' : 'text-secondary hover:text-primary'}`}
              >
                CREATE ACCOUNT
                {loginTab === 'register' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
              </button>
            </div>
          )}

          {loginTab === 'otp' && (
            <div className="mb-8">
              <h3 className="font-display-lg text-2xl text-primary font-bold uppercase tracking-wide mb-2">Verify Email</h3>
              <p className="text-sm text-secondary">Enter the 6-digit code sent to <strong>{regEmail}</strong></p>
            </div>
          )}

          {loginTab === 'login' ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-xs text-secondary font-bold">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-3 text-sm font-body-md rounded-none text-primary"
                  placeholder="e.g. name@domain.com"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-xs text-secondary font-bold">PASSWORD</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-3 text-sm font-body-md rounded-none text-primary"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 mt-2 hover:bg-secondary transition-all duration-300 border-none disabled:opacity-50"
              >
                {loading ? 'SIGNING IN...' : 'SIGN IN'}
              </button>
            </form>
          ) : loginTab === 'register' ? (
            <form onSubmit={handleRegister} className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-xs text-secondary font-bold">FIRST NAME</label>
                  <input required type="text" value={regFName} onChange={(e) => setRegFName(e.target.value)} className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-2 text-sm rounded-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-xs text-secondary font-bold">LAST NAME</label>
                  <input required type="text" value={regLName} onChange={(e) => setRegLName(e.target.value)} className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-2 text-sm rounded-none" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-xs text-secondary font-bold">MOBILE NUMBER</label>
                <input required type="tel" pattern="\d{10}" title="Please enter exactly 10 digits" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-2 text-sm rounded-none" placeholder="10 digits required" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-xs text-secondary font-bold">EMAIL ADDRESS</label>
                <input required type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-2 text-sm rounded-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-xs text-secondary font-bold">PASSWORD</label>
                <input required type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-2 text-sm rounded-none" placeholder="Min. 8 characters" />
              </div>
              <label className="flex items-start gap-3 cursor-pointer mt-1">
                <input type="checkbox" required className="rounded-none mt-1" />
                <span className="text-xs text-secondary leading-tight">I agree to the Privacy Policy and Terms of Service.</span>
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 mt-2 hover:bg-secondary transition-all duration-300 border-none disabled:opacity-50"
              >
                {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-xs text-secondary font-bold">ENTER 6-DIGIT OTP</label>
                <input required type="text" pattern="\d{6}" title="6 digit OTP" maxLength="6" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-3 text-center text-xl tracking-[0.5em] font-mono rounded-none text-primary" placeholder="••••••" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 mt-2 hover:bg-secondary transition-all duration-300 border-none disabled:opacity-50"
              >
                {loading ? 'VERIFYING...' : 'VERIFY OTP'}
              </button>
              
              <div className="text-center mt-4">
                {timer > 0 ? (
                  <p className="text-xs text-secondary">Resend OTP in <span className="font-bold text-primary">{timer}s</span></p>
                ) : (
                  <button 
                    type="button" 
                    onClick={resendOtp}
                    disabled={loading}
                    className="text-xs font-bold text-primary hover:text-muted-terracotta underline uppercase tracking-widest bg-transparent border-none cursor-pointer disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
