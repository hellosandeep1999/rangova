import React, { useState, useEffect } from 'react';
import { getSetting, updateSetting } from '../../lib/api';

export default function AdminSettings({ triggerNotification }) {
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [settings, setSettings] = useState({
    store_name: 'Rangova',
    currency: 'INR',
    contact_email: 'hello@rangova.com',
    support_phone: '+91 9876543210',
    company_description: '',
    company_address: '',
    policy_shipping: '',
    policy_tos: '',
    fashion_reels: [],
    team_reels: [],
    brand_overlay_image: '',
    free_shipping_threshold: 999,
    shipping_charge: 50
  });

  const [isUploading, setIsUploading] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const keys = [
        'store_name', 'currency', 'contact_email', 'support_phone',
        'company_description', 'company_address', 'policy_shipping', 'policy_tos',
        'fashion_reels', 'team_reels', 'brand_overlay_image', 'free_shipping_threshold', 'shipping_charge'
      ];
      const fetched = { ...settings };
      
      await Promise.all(
        keys.map(async (key) => {
          const val = await getSetting(key);
          if (val !== null && val !== undefined) {
            // For JSON fields, ensure they are parsed if they come as strings, though getSetting might return objects
            if ((key === 'fashion_reels' || key === 'team_reels') && typeof val === 'string') {
              try { fetched[key] = JSON.parse(val); } catch(e) { fetched[key] = []; }
            } else {
              fetched[key] = val;
            }
          }
        })
      );
      
      setSettings(fetched);
    } catch (err) {
      console.error(err);
      triggerNotification(`Error fetching settings: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      
      await Promise.all(
        Object.entries(settings).map(async ([key, value]) => {
          let valToSave = value;
          // Ensure arrays are stringified if needed, but updateSetting might handle it depending on implementation.
          // We'll pass it as is, and the API should store it as JSON if it's an object/array.
          await updateSetting(key, valToSave);
        })
      );

      triggerNotification('Store settings saved successfully!');
    } catch (err) {
      console.error(err);
      triggerNotification(`Error saving settings: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleReelChange = (type, index, field, value) => {
    const updated = [...settings[type]];
    updated[index][field] = value;
    handleChange(type, updated);
  };

  const addReel = (type) => {
    handleChange(type, [...settings[type], { src: '', label: '' }]);
  };

  const removeReel = (type, index) => {
    const updated = [...settings[type]];
    updated.splice(index, 1);
    handleChange(type, updated);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const { supabase } = await import('../../lib/api');
      const fileExt = file.name.split('.').pop();
      const fileName = `settings/brand_overlay_${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('rangova').upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('rangova').getPublicUrl(fileName);
      handleChange('brand_overlay_image', data.publicUrl);
      triggerNotification('Image uploaded. Remember to save settings.');
    } catch (err) {
      triggerNotification(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'policies', label: 'Policies' },
    { id: 'fashion_reels', label: 'Fashion Reels' },
    { id: 'team_reels', label: 'Behind the Craft' },
    { id: 'brand_overlay', label: 'Brand Overlay Image' }
  ];

  return (
    <div className="flex-1 flex flex-col bg-white border border-outline-variant/30 rounded-lg shadow-sm max-w-4xl mx-auto text-left overflow-hidden h-full">
      <div className="p-4 md:p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
        <h2 className="font-headline-sm text-xl font-bold text-primary">Store Settings</h2>
        <button 
          onClick={fetchSettings}
          disabled={loading || isSaving}
          className="p-2 text-secondary hover:text-primary hover:bg-surface-container rounded-full transition-colors cursor-pointer bg-transparent border-none"
          title="Refresh Settings"
        >
          <span className={`material-symbols-outlined ${(loading || isSaving) ? 'animate-spin' : ''}`}>refresh</span>
        </button>
      </div>

      <div className="flex border-b border-outline-variant/20 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 font-label-caps text-[10px] tracking-widest uppercase whitespace-nowrap border-b-2 transition-colors cursor-pointer bg-transparent ${activeTab === tab.id ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary hover:text-primary'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8 flex-1 overflow-y-auto">
        {loading ? (
          <div className="py-12 text-center text-secondary">Loading settings...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            
            {activeTab === 'general' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase font-bold">Store Name</label>
                    <input type="text" required value={settings.store_name} onChange={e => handleChange('store_name', e.target.value)} className="w-full border border-outline-variant/50 p-3 text-sm bg-transparent outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase font-bold">Currency</label>
                    <select required value={settings.currency} onChange={e => handleChange('currency', e.target.value)} className="w-full bg-transparent border border-outline-variant/50 p-3 text-sm outline-none focus:border-primary rounded-none">
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase font-bold">Contact Email</label>
                    <input type="email" required value={settings.contact_email} onChange={e => handleChange('contact_email', e.target.value)} className="w-full border border-outline-variant/50 p-3 text-sm bg-transparent outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase font-bold">Support Phone</label>
                    <input type="text" required value={settings.support_phone} onChange={e => handleChange('support_phone', e.target.value)} className="w-full border border-outline-variant/50 p-3 text-sm bg-transparent outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase font-bold">Min Amount for Free Shipping</label>
                    <input type="number" required value={settings.free_shipping_threshold} onChange={e => handleChange('free_shipping_threshold', e.target.value)} className="w-full border border-outline-variant/50 p-3 text-sm bg-transparent outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase font-bold">Shipping Charge</label>
                    <input type="number" required value={settings.shipping_charge} onChange={e => handleChange('shipping_charge', e.target.value)} className="w-full border border-outline-variant/50 p-3 text-sm bg-transparent outline-none focus:border-primary" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase font-bold">Company Description</label>
                    <textarea rows="3" value={settings.company_description} onChange={e => handleChange('company_description', e.target.value)} className="w-full border border-outline-variant/50 p-3 text-sm bg-transparent outline-none focus:border-primary"></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase font-bold">Company Address</label>
                    <textarea rows="2" value={settings.company_address} onChange={e => handleChange('company_address', e.target.value)} className="w-full border border-outline-variant/50 p-3 text-sm bg-transparent outline-none focus:border-primary"></textarea>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'policies' && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase font-bold">Shipping Policy (HTML / Markdown allowed)</label>
                  <textarea rows="8" value={settings.policy_shipping} onChange={e => handleChange('policy_shipping', e.target.value)} className="w-full border border-outline-variant/50 p-3 text-sm bg-transparent outline-none focus:border-primary font-mono text-xs"></textarea>
                </div>
                <div>
                  <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase font-bold">Terms of Service (HTML / Markdown allowed)</label>
                  <textarea rows="8" value={settings.policy_tos} onChange={e => handleChange('policy_tos', e.target.value)} className="w-full border border-outline-variant/50 p-3 text-sm bg-transparent outline-none focus:border-primary font-mono text-xs"></textarea>
                </div>
              </div>
            )}

            {(activeTab === 'fashion_reels' || activeTab === 'team_reels') && (() => {
              const type = activeTab;
              const items = settings[type] || [];
              return (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-secondary">Manage video/image reels displayed on the portal.</p>
                    <button type="button" onClick={() => addReel(type)} className="px-4 py-2 bg-surface-variant text-primary font-label-caps text-[10px] uppercase tracking-widest cursor-pointer border border-outline-variant/30 hover:bg-surface-container">
                      + Add Reel
                    </button>
                  </div>
                  {items.length === 0 ? (
                    <p className="text-xs text-secondary italic">No reels added yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {items.map((reel, idx) => (
                        <div key={idx} className="flex gap-4 items-start p-4 bg-surface-container-low border border-outline-variant/20 relative">
                          <div className="flex-1 space-y-3">
                            <div>
                              <label className="font-label-caps text-[9px] text-secondary tracking-widest uppercase block mb-1">Media URL</label>
                              <input type="text" value={reel.src} onChange={e => handleReelChange(type, idx, 'src', e.target.value)} placeholder="https://..." className="w-full border border-outline-variant/40 p-2 text-sm bg-white outline-none focus:border-primary" />
                            </div>
                            <div>
                              <label className="font-label-caps text-[9px] text-secondary tracking-widest uppercase block mb-1">Label / Title</label>
                              <input type="text" value={reel.label} onChange={e => handleReelChange(type, idx, 'label', e.target.value)} placeholder="Summer Collection..." className="w-full border border-outline-variant/40 p-2 text-sm bg-white outline-none focus:border-primary" />
                            </div>
                          </div>
                          {reel.src && (
                            <div className="w-20 h-24 bg-surface flex-shrink-0 border border-outline-variant/30 overflow-hidden">
                              {reel.src.match(/\.(mp4|webm)$/i) ? (
                                <video src={reel.src} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                              ) : (
                                <img src={reel.src} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                          )}
                          <button type="button" onClick={() => removeReel(type, idx)} className="text-muted-terracotta bg-transparent border-none p-1 cursor-pointer hover:opacity-70">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {activeTab === 'brand_overlay' && (
              <div className="space-y-6 animate-fadeIn">
                <p className="text-sm text-secondary">The overlay image is displayed over specific promotional sections.</p>
                <div>
                  <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase font-bold">Image URL</label>
                  <input type="text" value={settings.brand_overlay_image} onChange={e => handleChange('brand_overlay_image', e.target.value)} placeholder="https://..." className="w-full border border-outline-variant/50 p-3 text-sm bg-transparent outline-none focus:border-primary mb-4" />
                  
                  <p className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase font-bold">Or Upload Image</p>
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="text-sm mb-4" />
                  {isUploading && <span className="text-xs text-primary ml-4">Uploading...</span>}
                </div>
                {settings.brand_overlay_image && (
                  <div className="mt-4 p-4 border border-outline-variant/30 bg-surface-container-low inline-block">
                    <p className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Preview</p>
                    <img src={settings.brand_overlay_image} alt="Overlay preview" className="max-w-xs max-h-64 object-contain" />
                  </div>
                )}
              </div>
            )}

            <div className="pt-6 border-t border-outline-variant/20 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary text-white hover:bg-secondary font-label-caps text-[10px] tracking-widest uppercase px-8 py-3 transition-colors cursor-pointer border-none"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
