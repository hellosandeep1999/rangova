import React, { useState } from 'react';
import { placeOrder } from '../lib/api';

export default function Checkout({ cart, subtotal, navigateTo, setIsCartOpen, setCart, triggerNotification, currentUser, discount }) {
  const [selectedAddress, setSelectedAddress] = useState(currentUser?.addresses?.[0] || 'new');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const discountAmount = discount && discount.active ? Math.round(subtotal * (discount.percent/100)) : 0;
  const finalTotal = subtotal - discountAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      triggerNotification('Your cart is empty');
      return;
    }

    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    setIsSubmitting(true);
    try {
      let shippingAddress = selectedAddress;
      let city = '', state = '', pincode = '';
      
      if (selectedAddress === 'new') {
        shippingAddress = `${data.address} ${data.apt ? data.apt : ''}`.trim();
        city = data.city;
        state = data.state;
        pincode = data.pincode;
      }

      const orderPayload = {
        customer_email: data.email,
        customer_name: selectedAddress === 'new' ? `${data.firstName} ${data.lastName}` : (currentUser?.name || data.email.split('@')[0]),
        customer_phone: data.phone || '',
        total: finalTotal,
        subtotal: subtotal,
        discount_amount: discountAmount,
        shipping_address: shippingAddress,
        city: city,
        state: state,
        pincode: pincode,
        items: cart.map(item => ({
          title: item.title,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.price
        }))
      };

      await placeOrder(orderPayload);
      
      triggerNotification("Order placed successfully! Thank you for purchasing from Rangova.");
      setCart([]);
      navigateTo('home');
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-warm-ivory text-left">
      {/* Minimal Header */}
      <header className="w-full py-6 px-margin-mobile md:px-margin-desktop border-b border-outline-variant/20 flex justify-between items-center bg-white shadow-sm">
        <button
          onClick={() => navigateTo('home')}
          className="font-headline-lg text-headline-lg tracking-tighter text-primary bg-transparent border-none font-bold text-xl cursor-pointer"
        >
          RANGOVA
        </button>
        <button
          onClick={() => navigateTo('shop')}
          className="font-label-caps text-[11px] text-secondary hover:text-primary bg-transparent border-none uppercase tracking-widest cursor-pointer"
        >
          Continue Shopping
        </button>
      </header>

      <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-[60px]">
        {/* Left: Form */}
        <div className="lg:col-span-7 space-y-10">
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 font-label-caps text-[10px] text-secondary">
            <button onClick={() => setIsCartOpen(true)} className="hover:text-primary bg-transparent border-none p-0 cursor-pointer">Cart</button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold border-b border-primary pb-0.5">Information</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Shipping</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Payment</span>
          </nav>

          <form onSubmit={handleSubmit} className="space-y-8">
            <section>
              <div className="flex justify-between items-end mb-5">
                <h2 className="font-headline-sm text-lg font-bold text-primary">Contact Information</h2>
                <p className="text-xs text-secondary">Have an account? <button type="button" onClick={() => navigateTo('login')} className="text-primary underline underline-offset-4 bg-transparent border-none cursor-pointer">Log in</button></p>
              </div>
              <input
                name="email"
                required
                type="email"
                defaultValue={currentUser?.email || ''}
                placeholder="Email Address"
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 text-sm rounded-none"
              />
            </section>

            <section className="space-y-5">
              <h2 className="font-headline-sm text-lg font-bold text-primary">Shipping Address</h2>
              
              {currentUser && currentUser.addresses && currentUser.addresses.length > 0 && (
                <div className="mb-4">
                  <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Select a Saved Address</label>
                  <select 
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/50 focus:border-primary focus:ring-0 py-3 text-sm rounded-none px-4"
                  >
                    {currentUser.addresses.map((addr, idx) => (
                      <option key={idx} value={addr}>{addr}</option>
                    ))}
                    <option value="new">Use a new address</option>
                  </select>
                </div>
              )}

              {selectedAddress === 'new' && (
                <>
                  <select name="country" className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 text-sm rounded-none">
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                  </select>
                  <div className="grid grid-cols-2 gap-4">
                    <input name="firstName" required type="text" placeholder="First Name" className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 text-sm rounded-none" />
                    <input name="lastName" required type="text" placeholder="Last Name" className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 text-sm rounded-none" />
                  </div>
                  <input name="address" required type="text" placeholder="Address" className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 text-sm rounded-none" />
                  <input name="apt" type="text" placeholder="Apartment, suite, etc. (optional)" className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 text-sm rounded-none" />
                  <div className="grid grid-cols-3 gap-4">
                    <input name="city" required type="text" placeholder="City" className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 text-sm rounded-none" />
                    <input name="state" required type="text" placeholder="State" className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 text-sm rounded-none" />
                    <input name="pincode" required type="text" placeholder="PIN Code" className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 text-sm rounded-none" />
                  </div>
                  <input name="phone" required type="tel" placeholder="Phone Number" className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-3 text-sm rounded-none" />
                </>
              )}
            </section>

            <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center gap-4 pt-5 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => navigateTo('shop')}
                className="font-body-md text-secondary hover:text-primary transition-colors flex items-center justify-center bg-transparent border-none cursor-pointer"
              >
                <span className="material-symbols-outlined mr-2">arrow_back</span>
                Return to Shop
              </button>
              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="bg-primary text-on-primary px-8 py-4 font-label-caps text-label-caps hover:bg-secondary transition-all w-full md:w-auto border-none tracking-widest cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'PROCESSING...' : `PLACE ORDER (₹${finalTotal.toLocaleString()})`}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5 mt-8 lg:mt-0">
          <div className="bg-white p-6 md:p-8 shadow border border-outline-variant/10 sticky top-28">
            <h2 className="font-headline-sm text-base font-bold text-primary mb-5 border-b border-outline-variant/20 pb-3">Order Summary</h2>
            <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
              {cart.length === 0 && <p className="text-secondary text-sm">Your cart is empty.</p>}
              {cart.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="relative w-14 h-16 bg-surface-container-low flex-shrink-0 overflow-visible mt-2">
                    <img src={item.image} alt={item.title} className="w-14 h-16 object-cover" />
                    <span className="absolute -top-2.5 -right-2.5 bg-muted-terracotta text-white w-5 h-5 flex items-center justify-center rounded-full font-label-caps text-[10px] font-bold shadow-sm z-10">{item.quantity}</span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-sm font-bold text-primary leading-snug">{item.title}</h3>
                    <p className="text-[11px] text-secondary">{item.size && `Size: ${item.size}`} {item.color && `Color: ${item.color}`}</p>
                  </div>
                  <span className="font-price-lg text-sm text-primary">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-outline-variant/20 pt-5 mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-secondary">
                <span>Subtotal</span>
                <span className="text-primary font-bold">₹{subtotal.toLocaleString()}</span>
              </div>
              {discount && discount.active && (
                <div className="flex justify-between text-green-700">
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">loyalty</span> Discount ({discount.percent}%)</span>
                  <span className="font-bold">-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-secondary">
                <span>Shipping</span>
                <span className="text-primary font-bold italic">FREE Express</span>
              </div>
              <div className="flex justify-between items-center text-primary font-bold text-base pt-4 border-t border-primary/10">
                <span>Total</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
