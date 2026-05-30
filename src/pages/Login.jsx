import React, { useState } from 'react';

export default function Login({ navigateTo, triggerNotification, setCurrentUser }) {
  const [loginTab, setLoginTab] = useState('login');

  const mockUser = {
    name: "Aarav Sharma",
    email: "aarav@domain.com",
    addresses: [
      "12, Jaipur Craft Lane, Malviya Nagar, Jaipur, Rajasthan - 302017",
      "G-4, Shanti Kunj, Vasant Kunj, New Delhi - 110070"
    ],
    orders: [
      { id: "RNG-2026-9812", date: "May 15, 2026", items: "The Jaipur Silk Trench x 1", total: 69900, status: "Delivered" },
      { id: "RNG-2026-8041", date: "Apr 10, 2026", items: "Emerald Block Print Set x 1", total: 18500, status: "Shipped" }
    ]
  };

  return (
    <div className="w-full min-h-[90vh] flex flex-col md:flex-row text-left">
      {/* Left Illustration */}
      <div className="w-full md:w-1/2 relative bg-surface-container-low hidden md:block overflow-hidden min-h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center hover:scale-105 transition-transform duration-[8s] ease-in-out"
          style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCGyRBDfrxA8fs3Z5pjJDqpH8BdLxOFVVH0gMJqvKbE5GvyT0M6YgBxn4s9-xrPvqnrsPtMbceXNTOASimzcmp_PCku8MT4pXYTtz2Ij7d5H9vxiYyuKddTcfVR-LFn4qbqryZSAOE4xGEuwWOl4LFJWJDx7rM2zIjy_edDJwLDiPyT_QdGuoOnVbnofCCaB5X5rq8YcKp7-MvNtCx2KGVw77hoiKCf9BGYlq80FdlcM8tGZVUzZPO06P5EQXRCDPnj5Q_HpGTTJQ')` }}
        ></div>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-10 left-10">
          <span className="font-headline-lg text-white font-bold text-2xl tracking-tighter">RANGOVA</span>
        </div>
        <div className="absolute bottom-16 left-12 right-12 text-white">
          <h2 className="font-headline-xl text-[40px] text-white font-bold leading-tight mb-4 drop-shadow-sm">Crafted Heritage.</h2>
          <p className="font-body-lg text-base text-white/90 max-w-sm drop-shadow-sm leading-relaxed">Join our curated community to access exclusive collections, early arrivals, and bespoke editorial content.</p>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full md:w-1/2 bg-warm-ivory flex flex-col justify-center items-center px-6 md:px-16 py-12">
        <div className="w-full max-w-md">
          {/* Tabs */}
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

          {loginTab === 'login' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setCurrentUser(mockUser);
                triggerNotification("Signed in successfully. Welcome back to Rangova!");
                navigateTo('home');
              }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-xs text-secondary font-bold" htmlFor="email-input">EMAIL ADDRESS</label>
                <input
                  id="email-input"
                  type="email"
                  required
                  defaultValue="aarav@domain.com"
                  className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-3 text-sm font-body-md rounded-none text-primary"
                  placeholder="e.g. name@domain.com"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-xs text-secondary font-bold" htmlFor="pass-input">PASSWORD</label>
                <input
                  id="pass-input"
                  type="password"
                  required
                  defaultValue="password123"
                  className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-3 text-sm font-body-md rounded-none text-primary"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded-none" />
                  <span className="text-xs text-secondary">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => triggerNotification("Password reset email sent.")}
                  className="text-xs text-secondary hover:text-primary underline underline-offset-4 bg-transparent border-none cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 mt-2 hover:bg-secondary transition-all duration-300 border-none"
              >
                SIGN IN
              </button>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setCurrentUser(mockUser);
                triggerNotification("Account created successfully. Welcome!");
                navigateTo('home');
              }}
              className="flex flex-col gap-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-xs text-secondary font-bold" htmlFor="fname-input">FIRST NAME</label>
                  <input id="fname-input" required type="text" className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-2 text-sm rounded-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-xs text-secondary font-bold" htmlFor="lname-input">LAST NAME</label>
                  <input id="lname-input" required type="text" className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-2 text-sm rounded-none" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-xs text-secondary font-bold" htmlFor="reg-email-input">EMAIL ADDRESS</label>
                <input id="reg-email-input" required type="email" className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-2 text-sm rounded-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-xs text-secondary font-bold" htmlFor="reg-pass-input">PASSWORD</label>
                <input id="reg-pass-input" required type="password" className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-2 text-sm rounded-none" placeholder="Min. 8 characters" />
              </div>
              <label className="flex items-start gap-3 cursor-pointer mt-1">
                <input type="checkbox" required className="rounded-none mt-1" />
                <span className="text-xs text-secondary leading-tight">I agree to the Privacy Policy and Terms of Service.</span>
              </label>
              <button
                type="submit"
                className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 mt-2 hover:bg-secondary transition-all duration-300 border-none"
              >
                CREATE ACCOUNT
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
