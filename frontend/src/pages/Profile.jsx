import React, { useState } from 'react';

export default function Profile({ navigateTo, currentUser, setCurrentUser, triggerNotification }) {
  if (!currentUser) {
    navigateTo('login');
    return null;
  }

  const [activeTab, setActiveTab] = useState('details');
  const [editingAddressIdx, setEditingAddressIdx] = useState(null);
  const [addressText, setAddressText] = useState('');
  
  // Details state
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [name, setName] = useState(currentUser.name || '');

  const saveDetails = (e) => {
    e.preventDefault();
    setCurrentUser({ ...currentUser, name, phone });
    triggerNotification('Profile details updated successfully.');
  };

  const handleEditAddress = (idx) => {
    setEditingAddressIdx(idx);
    setAddressText(currentUser.addresses[idx]);
  };

  const saveAddress = () => {
    const newAddresses = [...currentUser.addresses];
    if (editingAddressIdx === -1) {
      newAddresses.push(addressText);
    } else {
      newAddresses[editingAddressIdx] = addressText;
    }
    setCurrentUser({ ...currentUser, addresses: newAddresses });
    setEditingAddressIdx(null);
    setAddressText('');
    triggerNotification('Address saved successfully.');
  };

  const deleteAddress = (idx) => {
    const newAddresses = currentUser.addresses.filter((_, i) => i !== idx);
    setCurrentUser({ ...currentUser, addresses: newAddresses });
    triggerNotification('Address deleted.');
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 flex flex-col md:flex-row gap-10 text-left min-h-[70vh]">
      {/* Sidebar */}
      <div className="w-full md:w-1/4">
        <h1 className="font-display-lg text-2xl font-bold text-primary mb-6">My Profile</h1>
        <div className="flex flex-col gap-3">
          <button onClick={() => setActiveTab('details')} className={`text-left font-label-caps text-xs tracking-widest uppercase pb-2 border-b transition-colors cursor-pointer bg-transparent border-none ${activeTab === 'details' ? 'text-primary font-bold border-primary' : 'text-secondary border-transparent hover:text-primary'}`}>Personal Details</button>
          <button onClick={() => setActiveTab('addresses')} className={`text-left font-label-caps text-xs tracking-widest uppercase pb-2 border-b transition-colors cursor-pointer bg-transparent border-none ${activeTab === 'addresses' ? 'text-primary font-bold border-primary' : 'text-secondary border-transparent hover:text-primary'}`}>Saved Addresses</button>
          <button onClick={() => setActiveTab('orders')} className={`text-left font-label-caps text-xs tracking-widest uppercase pb-2 border-b transition-colors cursor-pointer bg-transparent border-none ${activeTab === 'orders' ? 'text-primary font-bold border-primary' : 'text-secondary border-transparent hover:text-primary'}`}>Order History</button>
          <button onClick={() => { setCurrentUser(null); navigateTo('home'); triggerNotification('Logged out successfully.'); }} className="text-left font-label-caps text-xs tracking-widest text-muted-terracotta uppercase pb-2 mt-4 cursor-pointer bg-transparent border-none">Log Out</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full md:w-3/4">
        {activeTab === 'details' && (
          <div>
            <h2 className="font-headline-sm text-xl font-bold text-primary mb-6">Personal Details</h2>
            <form onSubmit={saveDetails} className="max-w-md space-y-5">
              <div>
                <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-white border border-outline-variant/50 px-4 py-3 text-sm focus:border-primary focus:ring-0" />
              </div>
              <div>
                <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Email Address</label>
                <input type="email" value={currentUser.email} disabled className="w-full bg-surface-container-low border border-outline-variant/30 px-4 py-3 text-sm text-secondary" />
              </div>
              <div>
                <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Mobile Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="e.g. +91 98765 43210" className="w-full bg-white border border-outline-variant/50 px-4 py-3 text-sm focus:border-primary focus:ring-0" />
              </div>
              <button type="submit" className="bg-primary text-white font-label-caps text-xs uppercase px-8 py-3 tracking-widest hover:bg-secondary transition-colors cursor-pointer border-none">Save Changes</button>
            </form>
          </div>
        )}

        {activeTab === 'addresses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-sm text-xl font-bold text-primary">Saved Addresses</h2>
              {editingAddressIdx === null && (
                <button onClick={() => { setEditingAddressIdx(-1); setAddressText(''); }} className="bg-transparent text-primary font-label-caps text-[10px] uppercase border border-primary px-4 py-2 hover:bg-primary hover:text-white transition-colors cursor-pointer">Add New</button>
              )}
            </div>

            {editingAddressIdx !== null && (
              <div className="bg-surface p-6 border border-outline-variant/20 mb-8">
                <h3 className="font-label-caps text-xs mb-4 uppercase tracking-widest">{editingAddressIdx === -1 ? 'Add New Address' : 'Edit Address'}</h3>
                <textarea value={addressText} onChange={e => setAddressText(e.target.value)} rows="3" className="w-full bg-white border border-outline-variant/50 px-4 py-3 text-sm mb-4 focus:border-primary focus:ring-0" placeholder="Enter full address..."></textarea>
                <div className="flex gap-4">
                  <button onClick={saveAddress} className="bg-primary text-white font-label-caps text-[10px] uppercase px-6 py-2 tracking-widest hover:bg-secondary cursor-pointer border-none">Save</button>
                  <button onClick={() => setEditingAddressIdx(null)} className="bg-transparent text-secondary font-label-caps text-[10px] uppercase px-6 py-2 tracking-widest hover:text-primary cursor-pointer border-none">Cancel</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentUser.addresses.map((addr, idx) => (
                <div key={idx} className="bg-white border border-outline-variant/20 p-5 flex flex-col justify-between h-full">
                  <p className="text-sm text-secondary leading-relaxed mb-4">{addr}</p>
                  <div className="flex gap-4 border-t border-outline-variant/10 pt-3">
                    <button onClick={() => handleEditAddress(idx)} className="text-[10px] font-label-caps uppercase text-primary hover:text-muted-terracotta transition-colors bg-transparent border-none cursor-pointer p-0">Edit</button>
                    <button onClick={() => deleteAddress(idx)} className="text-[10px] font-label-caps uppercase text-muted-terracotta hover:text-red-700 transition-colors bg-transparent border-none cursor-pointer p-0">Delete</button>
                  </div>
                </div>
              ))}
              {currentUser.addresses.length === 0 && <p className="text-sm text-secondary">No saved addresses found.</p>}
            </div>
          </div>
        )}

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
                  {currentUser.orders.map(order => (
                    <tr key={order.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-2 font-bold text-primary">{order.id}</td>
                      <td className="py-4 px-2 text-secondary">{order.date}</td>
                      <td className="py-4 px-2 text-secondary text-xs">{order.items}</td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-1 text-[10px] font-label-caps uppercase rounded-sm ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right font-price-lg font-bold">₹{order.total.toLocaleString()}</td>
                    </tr>
                  ))}
                  {currentUser.orders.length === 0 && (
                    <tr><td colSpan="5" className="py-8 text-center text-secondary">No orders found.</td></tr>
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
