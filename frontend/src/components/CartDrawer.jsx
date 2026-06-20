import React, { useState, useEffect } from 'react';
import { getShippingSettings } from '../lib/api';

export default function CartDrawer({ isCartOpen, setIsCartOpen, cart, updateQuantity, totalItemsCount, subtotal, navigateTo, discount }) {
  const [shippingConfig, setShippingConfig] = useState({ threshold: 999, charge: 50 });

  useEffect(() => {
    if (isCartOpen) {
      getShippingSettings().then(setShippingConfig);
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  // Free Shipping Threshold logic
  const shippingThreshold = shippingConfig.threshold;
  const progressPercent = Math.min((subtotal / shippingThreshold) * 100, 100);
  const remainingForFreeShipping = shippingThreshold - subtotal;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
      ></div>

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-warm-ivory h-full shadow-2xl flex flex-col z-10 border-l border-outline-variant/30 transform transition-transform duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-white">
          <h2 className="font-display-lg text-lg font-bold text-primary flex items-center gap-2.5 uppercase tracking-wider">
            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            Your Bag ({totalItemsCount})
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-secondary hover:text-primary transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center p-1"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Free Shipping Tracker (Dynamic Promotion Progress Bar) */}
        {cart.length > 0 && (
          <div className="bg-white border-b border-outline-variant/20 px-6 py-4">
            {remainingForFreeShipping > 0 ? (
              <p className="font-label-caps text-[9px] text-muted-terracotta tracking-wider mb-2 uppercase">
                You are <span className="font-bold text-primary">₹{remainingForFreeShipping.toLocaleString()}</span> away from <span className="underline decoration-muted-terracotta/40">Free Express Delivery</span>
              </p>
            ) : (
              <p className="font-label-caps text-[9px] text-green-700 tracking-wider mb-2 uppercase flex items-center gap-1.5 font-bold">
                <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                Your order qualifies for Free Courier Shipping!
              </p>
            )}
            <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${remainingForFreeShipping > 0 ? 'bg-muted-terracotta' : 'bg-green-700'}`} 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {cart.length === 0 ? (
            <div className="text-center py-24 flex flex-col items-center">
              <span className="material-symbols-outlined text-outline-variant text-[64px] mb-4 opacity-50">shopping_bag</span>
              <h3 className="font-display-lg text-lg uppercase tracking-wide text-primary mb-2">Empty Shopping Bag</h3>
              <p className="text-xs text-secondary max-w-[200px] leading-relaxed">Fill your wardrobe with beautiful, mastercrafted heritage textiles.</p>
              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  navigateTo('shop');
                }}
                className="mt-8 bg-primary text-on-primary px-8 py-3.5 uppercase font-label-caps text-[10px] tracking-widest hover:bg-muted-terracotta transition-colors border-none cursor-pointer"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item, index) => (
                <div key={index} className="flex gap-4 border-b border-outline-variant/10 pb-5 last:border-0 last:pb-0">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-16 h-20 object-cover bg-surface-container-low border border-outline-variant/20"
                  />
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-body-md text-xs font-bold text-primary leading-tight">{item.title}</h3>
                        <button 
                          onClick={() => updateQuantity(index, -item.quantity)}
                          className="text-secondary hover:text-muted-terracotta transition-colors bg-transparent border-none cursor-pointer p-0.5"
                          title="Remove item"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-secondary font-label-caps tracking-widest mt-1 uppercase">
                        {item.size && `Size: ${item.size}`} {item.color && ` • Color: ${item.color}`}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      {/* Modern minimalist quantity buttons */}
                      <div className="flex items-center border border-outline-variant/30 bg-white">
                        <button 
                          onClick={() => updateQuantity(index, -1)}
                          className="px-2 py-0.5 text-secondary hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[12px] font-bold">remove</span>
                        </button>
                        <span className="px-2 py-0.5 font-label-caps text-[10px] text-primary w-6 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(index, 1)}
                          className="px-2 py-0.5 text-secondary hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[12px] font-bold">add</span>
                        </button>
                      </div>
                      <span className="font-price-lg text-sm text-primary font-bold">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}


            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-outline-variant/20 bg-white space-y-4 shadow-xl">
            <div className="flex justify-between items-center text-secondary mb-2">
              <span className="font-display-lg text-sm font-bold uppercase tracking-wide">Estimated Subtotal</span>
              <span className="font-price-lg text-sm font-bold">₹{subtotal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center border-t border-outline-variant/20 pt-4 mt-2">
              <span className="font-display-lg text-lg font-bold text-primary uppercase tracking-wide">Estimated Total</span>
              <span className="font-price-lg text-xl text-primary font-bold">
                ₹{(subtotal + (subtotal >= shippingThreshold ? 0 : shippingConfig.charge)).toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-secondary tracking-wide italic leading-normal">Taxes, shipping, and promotional reductions are finalized inside the secure checkout.</p>
            <button 
              onClick={() => {
                setIsCartOpen(false);
                navigateTo('checkout');
              }}
              className="w-full bg-primary text-on-primary py-4 uppercase font-label-caps text-[10px] tracking-widest hover:bg-muted-terracotta transition-all duration-300 font-bold border-none cursor-pointer shadow-md hover:scale-[1.01]"
            >
              Secure Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
