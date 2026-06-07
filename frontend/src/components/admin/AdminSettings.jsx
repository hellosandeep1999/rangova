import React, { useState, useEffect } from 'react';
import { getSetting, updateSetting } from '../../lib/api';

export default function AdminSettings({ triggerNotification }) {
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    store_name: 'Rangova',
    currency: 'INR',
    contact_email: 'hello@rangova.com',
    support_phone: '+91 9876543210'
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const keys = ['store_name', 'currency', 'contact_email', 'support_phone'];
      const fetched = { ...settings };
      
      await Promise.all(
        keys.map(async (key) => {
          const val = await getSetting(key);
          if (val !== null && val !== undefined) {
            fetched[key] = val;
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
          await updateSetting(key, value);
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

  return (
    <div className="flex-1 flex flex-col bg-white border border-outline-variant/30 rounded-lg shadow-sm max-w-2xl mx-auto text-left">
      <div className="p-4 md:p-6 border-b border-outline-variant/20 flex justify-between items-center">
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

      <div className="p-6 md:p-8">
        {loading ? (
          <div className="py-12 text-center text-secondary">Loading settings...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase font-bold">Store Name</label>
                <input
                  type="text"
                  required
                  value={settings.store_name}
                  onChange={(e) => handleChange('store_name', e.target.value)}
                  className="w-full border border-outline-variant/50 p-3 text-sm bg-transparent outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase font-bold">Currency</label>
                <select
                  required
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full bg-transparent border border-outline-variant/50 p-3 text-sm outline-none focus:border-primary rounded-none"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase font-bold">Contact Email</label>
                <input
                  type="email"
                  required
                  value={settings.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="w-full border border-outline-variant/50 p-3 text-sm bg-transparent outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase font-bold">Support Phone</label>
                <input
                  type="text"
                  required
                  value={settings.support_phone}
                  onChange={(e) => handleChange('support_phone', e.target.value)}
                  className="w-full border border-outline-variant/50 p-3 text-sm bg-transparent outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant/10 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary text-white hover:bg-secondary font-label-caps text-[10px] tracking-widest uppercase px-8 py-3.5 transition-colors cursor-pointer border-none"
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
