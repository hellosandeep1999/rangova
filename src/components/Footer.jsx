import React from 'react';

export default function Footer({ navigateTo, triggerNotification }) {
  return (
    <footer className="bg-primary text-on-primary pt-12 pb-8 border-t border-surface-variant/30 text-left">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        
        <div className="col-span-12 md:col-span-4 flex flex-col mb-6 md:mb-0">
          <span className="font-headline-xl text-[24px] md:text-[32px] text-white tracking-tighter mb-3 block">RANGOVA</span>
          <p className="font-body-md text-sm text-white/60 max-w-xs leading-relaxed">
            Ancestral craft, modern minimalism. Elevating the everyday with premium hand-blocked heritage textiles.
          </p>
        </div>

        <div className="col-span-6 md:col-span-2 space-y-3">
          <span className="font-label-caps text-label-caps text-white font-bold uppercase tracking-widest block opacity-75">Explore</span>
          <ul className="space-y-2 text-sm text-white/60">
            <li><button onClick={() => navigateTo('shop')} className="hover:text-dusty-gold transition-colors bg-transparent border-none p-0 cursor-pointer">Collections</button></li>
            <li><button onClick={() => navigateTo('home')} className="hover:text-dusty-gold transition-colors bg-transparent border-none p-0 cursor-pointer">Seasonal Spread</button></li>
          </ul>
        </div>

        <div className="col-span-6 md:col-span-3 space-y-3">
          <span className="font-label-caps text-label-caps text-white font-bold uppercase tracking-widest block opacity-75">Support</span>
          <ul className="space-y-2 text-sm text-white/60 font-body-md">
            <li><button onClick={() => triggerNotification("Shipping & Returns: 14-day standard return policy.")} className="hover:text-dusty-gold transition-colors bg-transparent border-none p-0">Shipping &amp; Returns</button></li>
            <li><button onClick={() => triggerNotification("T&C applies to all Jaipur custom textiles.")} className="hover:text-dusty-gold transition-colors bg-transparent border-none p-0">Terms of Service</button></li>
            <li><button onClick={() => triggerNotification("Support email: care@rangova.com")} className="hover:text-dusty-gold transition-colors bg-transparent border-none p-0">Contact Support</button></li>
          </ul>
        </div>

        <div className="col-span-12 md:col-span-3 space-y-3 mt-4 md:mt-0">
          <span className="font-label-caps text-label-caps text-white font-bold uppercase tracking-widest block opacity-75">Newsletter</span>
          <p className="font-body-md text-sm text-white/60 mb-2">Subscribe for early access releases and craft notes.</p>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              triggerNotification("Subscribed to the Rangova Circular! Thank you.");
              e.target.reset();
            }}
            className="flex border-b border-white/30 pb-2 relative"
          >
            <input 
              required 
              type="email" 
              placeholder="Email Address" 
              className="bg-transparent border-none focus:ring-0 text-white placeholder:text-white/40 text-sm font-body-md w-full px-0" 
            />
            <button type="submit" className="text-white hover:text-dusty-gold transition-colors bg-transparent border-none">
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>
        </div>

      </div>

      <div className="px-margin-mobile md:px-margin-desktop mt-10 pt-5 border-t border-white/10 max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-white/40">
        <p className="font-label-caps text-label-caps text-[10px] tracking-widest text-center md:text-left">
          © 2026 RANGOVA. ALL RIGHTS RESERVED. ANCESTRAL CRAFT, MODERN MINIMALISM.
        </p>
        <div className="flex space-x-4 mt-3 md:mt-0">
          <span className="material-symbols-outlined text-[18px]">public</span>
          <span className="font-label-caps text-[10px]">INR (₹)</span>
        </div>
      </div>
    </footer>
  );
}
