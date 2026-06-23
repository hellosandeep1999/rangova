import React, { useState, useEffect } from 'react';
import { supabase, getAddresses, createAddress, updateAddress, deleteAddress } from '../lib/api';
import { AddressCardSkeleton, OrderRowSkeleton } from '../components/Skeleton';

export default function Profile({ navigateTo, currentUser, setCurrentUser, triggerNotification }) {
  if (!currentUser) {
    navigateTo('login');
    return null;
  }

  const [activeTab, setActiveTab] = useState('details');

  // ── Details ──────────────────────────────────────────
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [name, setName] = useState(currentUser.name || '');
  const [savingDetails, setSavingDetails] = useState(false);

  // ── Addresses ─────────────────────────────────────────
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // null | 'new' | address object
  const [addrForm, setAddrForm] = useState({
    label: 'Home', full_name: '', phone: '', address_line1: '', address_line2: '',
    city: '', state: '', pincode: '', is_default: false
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // ── Orders ────────────────────────────────────────────
  const [dbOrders, setDbOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch addresses on tab open
  useEffect(() => {
    if (activeTab === 'addresses' && currentUser?.email) {
      setLoadingAddresses(true);
      getAddresses(currentUser.email)
        .then(data => setAddresses(Array.isArray(data) ? data : []))
        .catch(() => setAddresses([]))
        .finally(() => setLoadingAddresses(false));
    }
  }, [activeTab, currentUser]);

  // Fetch orders on tab open
  useEffect(() => {
    if (activeTab === 'orders' && currentUser?.email) {
      setLoadingOrders(true);
      import('../lib/api').then(({ getOrdersByEmail }) => {
        getOrdersByEmail(currentUser.email)
          .then(data => setDbOrders(Array.isArray(data) ? data : []))
          .catch(() => setDbOrders([]))
          .finally(() => setLoadingOrders(false));
      });
    }
  }, [activeTab, currentUser]);

  // ── Logout ────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setCurrentUser(null);
    triggerNotification('Logged out successfully.');
    navigateTo('home');
  };

  // ── Details Save ──────────────────────────────────────
  const saveDetails = async (e) => {
    e.preventDefault();
    setSavingDetails(true);
    try {
      await supabase.auth.updateUser({ data: { first_name: name.split(' ')[0], last_name: name.split(' ').slice(1).join(' '), phone } });
      setCurrentUser({ ...currentUser, name, phone });
      triggerNotification('Profile updated successfully.');
    } catch (err) {
      triggerNotification('Failed to update profile.');
    } finally {
      setSavingDetails(false);
    }
  };

  // ── Address CRUD ──────────────────────────────────────
  const startNewAddress = () => {
    setAddrForm({ label: 'Home', full_name: name, phone: phone, address_line1: '', address_line2: '', city: '', state: '', pincode: '', is_default: addresses.length === 0 });
    setEditingAddress('new');
  };

  const startEditAddress = (addr) => {
    setAddrForm({
      label: addr.label || 'Home',
      full_name: addr.full_name || '',
      phone: addr.phone || '',
      address_line1: addr.address_line1 || '',
      address_line2: addr.address_line2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      is_default: addr.is_default || false,
    });
    setEditingAddress(addr);
  };

  const saveAddressHandler = async () => {
    if (!addrForm.address_line1 || !addrForm.city || !addrForm.state || !addrForm.pincode) {
      triggerNotification('Please fill in all required address fields.');
      return;
    }
    setSavingAddress(true);
    try {
      if (editingAddress === 'new') {
        const saved = await createAddress({ ...addrForm, customer_email: currentUser.email });
        setAddresses(prev => {
          const updated = addrForm.is_default ? prev.map(a => ({ ...a, is_default: false })) : [...prev];
          return [...updated, saved];
        });
        triggerNotification('Address added successfully.');
      } else {
        const saved = await updateAddress(editingAddress.id, { ...addrForm, customer_email: currentUser.email });
        setAddresses(prev => {
          const updated = addrForm.is_default ? prev.map(a => ({ ...a, is_default: false })) : [...prev];
          return updated.map(a => a.id === editingAddress.id ? saved : a);
        });
        triggerNotification('Address updated successfully.');
      }
      setEditingAddress(null);
    } catch (err) {
      triggerNotification('Failed to save address. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  const deleteAddressHandler = async (id) => {
    try {
      await deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      triggerNotification('Address deleted.');
    } catch {
      triggerNotification('Failed to delete address.');
    }
  };

  const addrLabels = ['Home', 'Work', 'Other'];

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 flex flex-col md:flex-row gap-10 text-left min-h-[70vh]">
      {/* Sidebar */}
      <div className="w-full md:w-1/4">
        <h1 className="font-display-lg text-2xl font-bold text-primary mb-2">My Profile</h1>
        <p className="text-xs text-secondary mb-6 font-body-md">{currentUser.email}</p>
        <div className="flex flex-col gap-3">
          {[
            { key: 'details', label: 'Personal Details' },
            { key: 'addresses', label: 'Saved Addresses' },
            { key: 'orders', label: 'Order History' },
          ].map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              className={`text-left font-label-caps text-xs tracking-widest uppercase pb-2 border-b transition-colors cursor-pointer bg-transparent border-none ${activeTab === item.key ? 'text-primary font-bold border-primary' : 'text-secondary border-transparent hover:text-primary'}`}>
              {item.label}
            </button>
          ))}
          <button onClick={handleLogout}
            className="text-left font-label-caps text-xs tracking-widest text-muted-terracotta uppercase pb-2 mt-4 cursor-pointer bg-transparent border-none hover:text-red-700 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">logout</span>
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full md:w-3/4">

        {/* ── Personal Details ── */}
        {activeTab === 'details' && (
          <div>
            <h2 className="font-headline-sm text-xl font-bold text-primary mb-6">Personal Details</h2>
            <form onSubmit={saveDetails} className="max-w-md space-y-5">
              <div>
                <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full bg-white border border-outline-variant/50 px-4 py-3 text-sm focus:border-primary focus:ring-0" />
              </div>
              <div>
                <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Email Address</label>
                <input type="email" value={currentUser.email} disabled
                  className="w-full bg-surface-container-low border border-outline-variant/30 px-4 py-3 text-sm text-secondary" />
              </div>
              <div>
                <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Mobile Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9876543210"
                  className="w-full bg-white border border-outline-variant/50 px-4 py-3 text-sm focus:border-primary focus:ring-0" />
              </div>
              <button type="submit" disabled={savingDetails}
                className="bg-primary text-white font-label-caps text-xs uppercase px-8 py-3 tracking-widest hover:bg-secondary transition-colors cursor-pointer border-none disabled:opacity-50">
                {savingDetails ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </form>
          </div>
        )}

        {/* ── Saved Addresses ── */}
        {activeTab === 'addresses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-sm text-xl font-bold text-primary">Saved Addresses</h2>
              {!editingAddress && (
                <button onClick={startNewAddress}
                  className="bg-transparent text-primary font-label-caps text-[10px] uppercase border border-primary px-4 py-2 hover:bg-primary hover:text-white transition-colors cursor-pointer">
                  + Add New
                </button>
              )}
            </div>

            {/* Address Form */}
            {editingAddress !== null && (
              <div className="bg-white border border-outline-variant/20 p-6 mb-8 shadow-sm">
                <h3 className="font-label-caps text-xs mb-5 uppercase tracking-widest border-b border-outline-variant/20 pb-3">
                  {editingAddress === 'new' ? 'New Address' : 'Edit Address'}
                </h3>
                <div className="space-y-4">
                  {/* Label */}
                  <div>
                    <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Label</label>
                    <div className="flex gap-2">
                      {addrLabels.map(l => (
                        <button key={l} type="button" onClick={() => setAddrForm(f => ({ ...f, label: l }))}
                          className={`font-label-caps text-[10px] uppercase px-3 py-1.5 border transition-colors cursor-pointer ${addrForm.label === l ? 'bg-primary text-white border-primary' : 'bg-transparent text-secondary border-outline-variant/40 hover:border-primary'}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-1 uppercase">Full Name *</label>
                      <input type="text" value={addrForm.full_name} onChange={e => setAddrForm(f => ({ ...f, full_name: e.target.value }))}
                        className="w-full bg-transparent border-b border-outline focus:border-primary focus:ring-0 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-1 uppercase">Phone</label>
                      <input type="tel" value={addrForm.phone} onChange={e => setAddrForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full bg-transparent border-b border-outline focus:border-primary focus:ring-0 py-2 text-sm" placeholder="10 digits" />
                    </div>
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-1 uppercase">Address Line 1 *</label>
                    <input type="text" value={addrForm.address_line1} onChange={e => setAddrForm(f => ({ ...f, address_line1: e.target.value }))}
                      className="w-full bg-transparent border-b border-outline focus:border-primary focus:ring-0 py-2 text-sm" placeholder="Street, building, area" />
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-1 uppercase">Address Line 2 (Optional)</label>
                    <input type="text" value={addrForm.address_line2} onChange={e => setAddrForm(f => ({ ...f, address_line2: e.target.value }))}
                      className="w-full bg-transparent border-b border-outline focus:border-primary focus:ring-0 py-2 text-sm" placeholder="Flat, floor, landmark" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-1 uppercase">City *</label>
                      <input type="text" value={addrForm.city} onChange={e => setAddrForm(f => ({ ...f, city: e.target.value }))}
                        className="w-full bg-transparent border-b border-outline focus:border-primary focus:ring-0 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-1 uppercase">State *</label>
                      <input type="text" value={addrForm.state} onChange={e => setAddrForm(f => ({ ...f, state: e.target.value }))}
                        className="w-full bg-transparent border-b border-outline focus:border-primary focus:ring-0 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-1 uppercase">Pincode *</label>
                      <input type="text" value={addrForm.pincode} onChange={e => setAddrForm(f => ({ ...f, pincode: e.target.value }))}
                        className="w-full bg-transparent border-b border-outline focus:border-primary focus:ring-0 py-2 text-sm" />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer mt-1">
                    <input type="checkbox" checked={addrForm.is_default} onChange={e => setAddrForm(f => ({ ...f, is_default: e.target.checked }))}
                      className="rounded-none w-4 h-4 cursor-pointer" />
                    <span className="text-xs text-secondary">Set as default address</span>
                  </label>
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={saveAddressHandler} disabled={savingAddress}
                    className="bg-primary text-white font-label-caps text-[10px] uppercase px-6 py-2.5 tracking-widest hover:bg-secondary cursor-pointer border-none disabled:opacity-50">
                    {savingAddress ? 'SAVING...' : 'SAVE ADDRESS'}
                  </button>
                  <button onClick={() => setEditingAddress(null)}
                    className="bg-transparent text-secondary font-label-caps text-[10px] uppercase px-6 py-2.5 tracking-widest hover:text-primary cursor-pointer border-none">
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            {/* Address list */}
            {loadingAddresses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AddressCardSkeleton count={2} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <div key={addr.id} className={`bg-white border p-5 flex flex-col justify-between h-full relative ${addr.is_default ? 'border-primary' : 'border-outline-variant/20'}`}>
                    {addr.is_default && (
                      <span className="absolute top-3 right-3 font-label-caps text-[8px] uppercase tracking-widest bg-primary text-white px-2 py-0.5">Default</span>
                    )}
                    <div>
                      <span className="font-label-caps text-[10px] text-muted-terracotta uppercase tracking-widest mb-2 block">{addr.label}</span>
                      {addr.full_name && <p className="text-sm font-bold text-primary mb-1">{addr.full_name}</p>}
                      <p className="text-sm text-secondary leading-relaxed">
                        {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}<br />
                        {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                      {addr.phone && <p className="text-xs text-secondary mt-1">📞 {addr.phone}</p>}
                    </div>
                    <div className="flex gap-4 border-t border-outline-variant/10 pt-3 mt-4">
                      <button onClick={() => startEditAddress(addr)}
                        className="text-[10px] font-label-caps uppercase text-primary hover:text-muted-terracotta transition-colors bg-transparent border-none cursor-pointer p-0">Edit</button>
                      <button onClick={() => deleteAddressHandler(addr.id)}
                        className="text-[10px] font-label-caps uppercase text-muted-terracotta hover:text-red-700 transition-colors bg-transparent border-none cursor-pointer p-0">Delete</button>
                    </div>
                  </div>
                ))}
                {addresses.length === 0 && !editingAddress && (
                  <div className="col-span-2 text-center py-12">
                    <span className="material-symbols-outlined text-4xl text-secondary/30 block mb-3">location_off</span>
                    <p className="text-sm text-secondary mb-4">No saved addresses yet.</p>
                    <button onClick={startNewAddress}
                      className="bg-primary text-white font-label-caps text-[10px] uppercase px-6 py-2.5 tracking-widest hover:bg-secondary cursor-pointer border-none">
                      Add Your First Address
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Order History ── */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="font-headline-sm text-xl font-bold text-primary mb-6">Order History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 font-label-caps text-[10px] text-secondary tracking-wider uppercase">
                    <th className="py-3 px-2">Order ID</th>
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Items</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm">
                  {loadingOrders ? (
                    <OrderRowSkeleton count={3} />
                  ) : dbOrders.length > 0 ? (
                    dbOrders.map(order => (
                      <tr key={order.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-4 px-2 font-bold text-primary">
                          <span className="font-mono text-xs">{order.id.slice(0, 8)}…</span>
                        </td>
                        <td className="py-4 px-2 text-secondary whitespace-nowrap text-xs">
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-2 text-secondary text-xs">
                          {Array.isArray(order.items) ? order.items.map(i => `${i.quantity}x ${i.title}`).join(', ') : '-'}
                        </td>
                        <td className="py-4 px-2">
                          <span className={`px-2 py-1 text-[10px] font-label-caps uppercase tracking-widest font-bold rounded-sm ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right font-price-lg font-bold">₹{order.total.toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="py-12 text-center text-secondary">
                      <span className="material-symbols-outlined text-3xl block mb-2 text-secondary/30">receipt_long</span>
                      No orders found.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
