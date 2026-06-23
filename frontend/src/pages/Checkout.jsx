import React, { useState, useEffect } from 'react';
import { placeOrder, getShippingSettings, getAddresses, createAddress } from '../lib/api';
import { AddressCardSkeleton } from '../components/Skeleton';

export default function Checkout({ cart, subtotal, navigateTo, setIsCartOpen, setCart, triggerNotification, currentUser }) {
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingConfig, setShippingConfig] = useState({ threshold: 999, charge: 50 });
  const [allDiscounts, setAllDiscounts] = useState([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState(null);
  const [hasPastOrders, setHasPastOrders] = useState(false);
  const [savingNewAddr, setSavingNewAddr] = useState(false);

  // New address form state
  const [newAddr, setNewAddr] = useState({
    label: 'Home', full_name: currentUser?.name || '', phone: currentUser?.phone || '',
    address_line1: '', address_line2: '', city: '', state: '', pincode: ''
  });

  // If not logged in, show login prompt
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-warm-ivory">
        <header className="w-full py-6 px-margin-mobile md:px-margin-desktop border-b border-outline-variant/20 flex justify-between items-center bg-white shadow-sm">
          <button onClick={() => navigateTo('home')}
            className="font-headline-lg tracking-tighter text-primary bg-transparent border-none font-bold text-xl cursor-pointer">
            RANGOVA
          </button>
        </header>
        <div className="flex-grow flex flex-col items-center justify-center gap-6 py-20 px-4">
          <span className="material-symbols-outlined text-5xl text-secondary/40">lock</span>
          <h2 className="font-headline-sm text-2xl font-bold text-primary text-center">Sign in to Checkout</h2>
          <p className="text-sm text-secondary text-center max-w-sm">
            Please sign in or create an account to place your order. Your cart will be saved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigateTo('login')}
              className="bg-primary text-white font-label-caps text-[11px] uppercase px-8 py-3.5 tracking-widest hover:bg-secondary transition-colors border-none cursor-pointer">
              Sign In
            </button>
            <button onClick={() => navigateTo('login')}
              className="bg-transparent text-primary font-label-caps text-[11px] uppercase px-8 py-3.5 tracking-widest border border-primary hover:bg-primary hover:text-white transition-colors cursor-pointer">
              Create Account
            </button>
          </div>
          <button onClick={() => navigateTo('shop')}
            className="text-xs text-secondary underline hover:text-primary bg-transparent border-none cursor-pointer mt-2">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Fetch data on mount
  useEffect(() => {
    getShippingSettings().then(setShippingConfig);
  }, []);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const { getActiveDiscount } = await import('../lib/api');
        const data = await getActiveDiscount();
        if (Array.isArray(data) && data.length > 0) setAllDiscounts(data);
      } catch (e) {}
    };
    fetchDiscounts();
  }, []);

  useEffect(() => {
    if (currentUser?.email) {
      const fetchEmailStatus = async () => {
        try {
          const { getOrdersByEmail } = await import('../lib/api');
          const orders = await getOrdersByEmail(currentUser.email);
          setHasPastOrders(orders && orders.length > 0);
        } catch { setHasPastOrders(false); }
      };
      fetchEmailStatus();
    }
  }, [currentUser]);

  // Fetch saved addresses
  useEffect(() => {
    if (currentUser?.email) {
      setLoadingAddresses(true);
      getAddresses(currentUser.email)
        .then(data => {
          const addrs = Array.isArray(data) ? data : [];
          setSavedAddresses(addrs);
          const defaultAddr = addrs.find(a => a.is_default) || addrs[0];
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
          else setShowNewAddressForm(true); // no saved address, show form
        })
        .catch(() => { setSavedAddresses([]); setShowNewAddressForm(true); })
        .finally(() => setLoadingAddresses(false));
    }
  }, [currentUser]);

  // Auto-apply best discount
  useEffect(() => {
    if (allDiscounts.length === 0 || selectedDiscountId !== null) return;
    const valid = allDiscounts.filter(d => d.discount_type !== 'first_order' || !hasPastOrders);
    if (valid.length > 0) {
      valid.sort((a, b) => b.percent - a.percent);
      setSelectedDiscountId(valid[0].id);
    }
  }, [allDiscounts, hasPastOrders, selectedDiscountId]);

  const selectedDiscount = allDiscounts.find(d => d.id === selectedDiscountId);
  const isDiscountValid = selectedDiscount
    ? (selectedDiscount.discount_type === 'first_order' ? !hasPastOrders : true)
    : false;
  const discountAmount = isDiscountValid && selectedDiscount ? Math.round(subtotal * (selectedDiscount.percent / 100)) : 0;
  const shippingCost = subtotal >= shippingConfig.threshold ? 0 : shippingConfig.charge;
  const finalTotal = subtotal - discountAmount + shippingCost;

  // Get selected address object
  const selectedAddr = savedAddresses.find(a => a.id === selectedAddressId);

  // Save new address then use it
  const handleSaveAndUseNewAddress = async () => {
    if (!newAddr.address_line1 || !newAddr.city || !newAddr.state || !newAddr.pincode) {
      triggerNotification('Please fill in all required address fields.');
      return;
    }
    setSavingNewAddr(true);
    try {
      const saved = await createAddress({ ...newAddr, customer_email: currentUser.email });
      setSavedAddresses(prev => [...prev, saved]);
      setSelectedAddressId(saved.id);
      setShowNewAddressForm(false);
      triggerNotification('Address saved.');
    } catch {
      triggerNotification('Failed to save address.');
    } finally {
      setSavingNewAddr(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) { triggerNotification('Your cart is empty.'); return; }
    if (!selectedAddr && !showNewAddressForm) { triggerNotification('Please select or add a delivery address.'); return; }

    let shippingAddress, city, state, pincode, customerPhone;

    if (selectedAddr) {
      shippingAddress = `${selectedAddr.address_line1}${selectedAddr.address_line2 ? ', ' + selectedAddr.address_line2 : ''}`;
      city = selectedAddr.city;
      state = selectedAddr.state;
      pincode = selectedAddr.pincode;
      customerPhone = selectedAddr.phone || currentUser.phone || '';
    } else {
      if (!newAddr.address_line1 || !newAddr.city || !newAddr.state || !newAddr.pincode) {
        triggerNotification('Please complete the address form before placing your order.');
        return;
      }
      shippingAddress = `${newAddr.address_line1}${newAddr.address_line2 ? ', ' + newAddr.address_line2 : ''}`;
      city = newAddr.city;
      state = newAddr.state;
      pincode = newAddr.pincode;
      customerPhone = newAddr.phone || currentUser.phone || '';
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customer_email: currentUser.email,
        customer_name: currentUser.name || currentUser.email.split('@')[0],
        customer_phone: customerPhone,
        total: finalTotal,
        subtotal,
        discount_amount: discountAmount,
        shipping_charge: shippingCost,
        shipping_address: shippingAddress,
        city, state, pincode,
        items: cart.map(item => ({
          title: item.title, size: item.size, color: item.color,
          quantity: item.quantity, price: item.price
        }))
      };

      await placeOrder(orderPayload);
      triggerNotification('Order placed successfully! Thank you for purchasing from Rangova.');
      setCart([]);
      navigateTo('home');
    } catch (err) {
      console.error(err);
      if (err.message.includes('blocked')) {
        try {
          const parsed = JSON.parse(err.message);
          triggerNotification(parsed.error || 'You are blocked. Please contact support.');
        } catch {
          triggerNotification('You are blocked. Please contact support.');
        }
      } else {
        triggerNotification('Failed to place order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const addrLabels = ['Home', 'Work', 'Other'];

  return (
    <div className="min-h-screen flex flex-col bg-warm-ivory text-left">
      {/* Header */}
      <header className="w-full py-6 px-margin-mobile md:px-margin-desktop border-b border-outline-variant/20 flex justify-between items-center bg-white shadow-sm">
        <button onClick={() => navigateTo('home')}
          className="font-headline-lg tracking-tighter text-primary bg-transparent border-none font-bold text-xl cursor-pointer">
          RANGOVA
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs text-secondary font-body-md hidden sm:inline">{currentUser.email}</span>
          <button onClick={() => navigateTo('shop')}
            className="font-label-caps text-[11px] text-secondary hover:text-primary bg-transparent border-none uppercase tracking-widest cursor-pointer">
            Continue Shopping
          </button>
        </div>
      </header>

      <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-[60px]">
        {/* Left: Form */}
        <div className="lg:col-span-7 space-y-10">
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 font-label-caps text-[10px] text-secondary">
            <button onClick={() => setIsCartOpen(true)} className="hover:text-primary bg-transparent border-none p-0 cursor-pointer">Cart</button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold border-b border-primary pb-0.5">Address</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Payment</span>
          </nav>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Shipping Address Section */}
            <section className="space-y-4">
              <h2 className="font-headline-sm text-lg font-bold text-primary">Delivery Address</h2>

              {loadingAddresses ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <AddressCardSkeleton count={2} />
                </div>
              ) : (
                <>
                  {/* Saved address cards */}
                  {savedAddresses.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map(addr => (
                        <div key={addr.id}
                          onClick={() => { setSelectedAddressId(addr.id); setShowNewAddressForm(false); }}
                          className={`relative p-4 border cursor-pointer transition-all duration-200 ${selectedAddressId === addr.id && !showNewAddressForm ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline-variant/30 hover:border-primary/50 bg-white'}`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${selectedAddressId === addr.id && !showNewAddressForm ? 'border-primary' : 'border-outline-variant'}`}>
                              {selectedAddressId === addr.id && !showNewAddressForm && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-label-caps text-[9px] text-muted-terracotta uppercase tracking-widest">{addr.label}</span>
                                {addr.is_default && <span className="font-label-caps text-[8px] bg-primary text-white px-1.5 py-0.5 uppercase">Default</span>}
                              </div>
                              {addr.full_name && <p className="text-sm font-bold text-primary">{addr.full_name}</p>}
                              <p className="text-xs text-secondary leading-relaxed">
                                {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}<br />
                                {addr.city}, {addr.state} — {addr.pincode}
                              </p>
                              {addr.phone && <p className="text-xs text-secondary mt-0.5">📞 {addr.phone}</p>}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add new address option */}
                      <div onClick={() => { setShowNewAddressForm(true); setSelectedAddressId(null); }}
                        className={`p-4 border cursor-pointer transition-all duration-200 flex items-center gap-3 ${showNewAddressForm ? 'border-primary bg-primary/5' : 'border-dashed border-outline-variant/40 hover:border-primary/50 bg-white'}`}>
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${showNewAddressForm ? 'border-primary' : 'border-outline-variant'}`}>
                          {showNewAddressForm && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">Use a new address</p>
                          <p className="text-xs text-secondary">Add a delivery address</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* New address form */}
                  {showNewAddressForm && (
                    <div className="bg-white border border-outline-variant/20 p-5 space-y-4 shadow-sm">
                      <h3 className="font-label-caps text-[10px] text-secondary uppercase tracking-widest pb-3 border-b border-outline-variant/20">New Delivery Address</h3>

                      {/* Label */}
                      <div className="flex gap-2">
                        {addrLabels.map(l => (
                          <button key={l} type="button" onClick={() => setNewAddr(f => ({ ...f, label: l }))}
                            className={`font-label-caps text-[10px] uppercase px-3 py-1.5 border transition-colors cursor-pointer ${newAddr.label === l ? 'bg-primary text-white border-primary' : 'bg-transparent text-secondary border-outline-variant/40 hover:border-primary'}`}>
                            {l}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-1 uppercase">Full Name *</label>
                          <input type="text" required value={newAddr.full_name} onChange={e => setNewAddr(f => ({ ...f, full_name: e.target.value }))}
                            className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm rounded-none" />
                        </div>
                        <div>
                          <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-1 uppercase">Phone</label>
                          <input type="tel" value={newAddr.phone} onChange={e => setNewAddr(f => ({ ...f, phone: e.target.value }))}
                            className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm rounded-none" placeholder="10 digits" />
                        </div>
                      </div>
                      <div>
                        <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-1 uppercase">Address Line 1 *</label>
                        <input type="text" required value={newAddr.address_line1} onChange={e => setNewAddr(f => ({ ...f, address_line1: e.target.value }))}
                          className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm rounded-none" placeholder="Street, building, area" />
                      </div>
                      <div>
                        <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-1 uppercase">Address Line 2 (Optional)</label>
                        <input type="text" value={newAddr.address_line2} onChange={e => setNewAddr(f => ({ ...f, address_line2: e.target.value }))}
                          className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm rounded-none" placeholder="Flat, floor, landmark" />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-1 uppercase">City *</label>
                          <input type="text" required value={newAddr.city} onChange={e => setNewAddr(f => ({ ...f, city: e.target.value }))}
                            className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm rounded-none" />
                        </div>
                        <div>
                          <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-1 uppercase">State *</label>
                          <input type="text" required value={newAddr.state} onChange={e => setNewAddr(f => ({ ...f, state: e.target.value }))}
                            className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm rounded-none" />
                        </div>
                        <div>
                          <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-1 uppercase">Pincode *</label>
                          <input type="text" required value={newAddr.pincode} onChange={e => setNewAddr(f => ({ ...f, pincode: e.target.value }))}
                            className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 py-2 text-sm rounded-none" />
                        </div>
                      </div>

                      {savedAddresses.length > 0 && (
                        <button type="button" onClick={handleSaveAndUseNewAddress} disabled={savingNewAddr}
                          className="text-xs font-label-caps uppercase text-muted-terracotta hover:text-primary border-b border-muted-terracotta bg-transparent border-t-0 border-l-0 border-r-0 cursor-pointer pb-0.5 disabled:opacity-50">
                          {savingNewAddr ? 'Saving...' : 'Save this address to my profile'}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Discount Coupons */}
            {allDiscounts.length > 0 && (
              <section>
                <h2 className="font-headline-sm text-lg font-bold text-primary mb-4">Available Coupons</h2>
                <div className="space-y-2">
                  {allDiscounts.map(d => {
                    const isValid = d.discount_type !== 'first_order' || !hasPastOrders;
                    const isSelected = selectedDiscountId === d.id;
                    return (
                      <div key={d.id} onClick={() => setSelectedDiscountId(isSelected ? null : d.id)}
                        className={`p-3 border text-xs cursor-pointer transition-colors flex justify-between items-center ${isSelected ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/30 text-secondary hover:border-outline-variant/60'}`}>
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            {d.code} <span className="text-[10px] bg-surface-container px-1.5 py-0.5 rounded font-normal">{d.percent}% OFF</span>
                          </div>
                          {!isValid && isSelected && <div className="text-[10px] text-muted-terracotta mt-1">Valid for first-time orders only.</div>}
                        </div>
                        <div className="w-4 h-4 rounded-full border flex items-center justify-center border-primary">
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center gap-4 pt-5 border-t border-outline-variant/20">
              <button type="button" onClick={() => navigateTo('shop')}
                className="font-body-md text-secondary hover:text-primary transition-colors flex items-center justify-center bg-transparent border-none cursor-pointer">
                <span className="material-symbols-outlined mr-2">arrow_back</span>
                Return to Shop
              </button>
              <button type="submit" disabled={isSubmitting || cart.length === 0}
                className="bg-primary text-on-primary px-8 py-4 font-label-caps text-label-caps hover:bg-secondary transition-all w-full md:w-auto border-none tracking-widest cursor-pointer disabled:opacity-50">
                {isSubmitting ? 'PROCESSING...' : `PLACE ORDER — ₹${finalTotal.toLocaleString()}`}
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
              {isDiscountValid && selectedDiscount && (
                <div className="flex justify-between text-green-700">
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">loyalty</span> Discount ({selectedDiscount.percent}%)</span>
                  <span className="font-bold">-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-secondary">
                <span>Shipping</span>
                <span className="text-primary font-bold">
                  {shippingCost === 0 ? <i className="italic">FREE Express</i> : `₹${shippingCost}`}
                </span>
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
