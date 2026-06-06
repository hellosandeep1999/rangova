import React, { useState } from 'react';

export default function Contact({ navigateTo, triggerNotification, currentUser }) {
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);
    setTimeout(() => {
      triggerNotification("Your secure inquiry has been submitted. Our concierge team will respond within 24 hours.");
      setMessage('');
      setIsSubmitting(false);
      navigateTo('home');
    }, 1200);
  };

  return (
    <div className="w-full min-h-[85vh] bg-warm-ivory py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-left animate-fadeIn">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        
        {/* Info Column */}
        <div className="md:col-span-5 space-y-8">
          <div>
            <span className="font-label-caps text-label-caps text-muted-terracotta tracking-widest block mb-2">Concierge & Care</span>
            <h1 className="font-display-lg text-3xl md:text-4xl font-bold tracking-tight text-primary uppercase leading-tight">Contact Us</h1>
          </div>
          
          <p className="font-body-md text-secondary leading-relaxed">
            Our private client concierge is available to assist you with styling advice, sizing guidance, order updates, or bespoke inquiries.
          </p>

          <div className="space-y-4 pt-4 border-t border-outline-variant/30">
            <div>
              <span className="font-label-caps text-[10px] text-secondary tracking-widest block uppercase mb-1">Mailing Address</span>
              <p className="text-xs text-primary font-medium">108, Craft Boulevard, Sector 5, Mansarovar, Jaipur, RJ - 302020</p>
            </div>
            <div>
              <span className="font-label-caps text-[10px] text-secondary tracking-widest block uppercase mb-1">Client Services</span>
              <p className="text-xs text-primary font-medium">care@rangova.com</p>
              <p className="text-xs text-primary font-medium">+91 141 409 8122</p>
            </div>
            <div>
              <span className="font-label-caps text-[10px] text-secondary tracking-widest block uppercase mb-1">Hours</span>
              <p className="text-xs text-secondary">Monday – Saturday: 10:00 AM – 7:00 PM IST</p>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="md:col-span-7 bg-surface border border-outline-variant/30 p-8 md:p-10 shadow-sm relative">
          {!currentUser ? (
            <div className="text-center py-12 space-y-6">
              <span className="material-symbols-outlined text-4xl text-muted-terracotta">lock</span>
              <h3 className="font-display-lg text-lg font-bold uppercase tracking-wider text-primary">Secure Inquiry Gated</h3>
              <p className="text-sm text-secondary max-w-sm mx-auto leading-relaxed">
                To maintain the integrity of our support and protect your private transaction history, we require you to be authenticated before sending a concierge query.
              </p>
              <button
                onClick={() => navigateTo('login')}
                className="inline-block bg-primary text-white font-label-caps text-[11px] px-8 py-3.5 tracking-widest hover:bg-muted-terracotta transition-colors uppercase"
              >
                Sign In to Continue
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="font-display-lg text-base font-bold uppercase tracking-wider text-primary border-b border-outline-variant/20 pb-3 mb-2">Send Concierge Message</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="font-label-caps text-[10px] text-secondary tracking-widest uppercase">Client Name</span>
                  <div className="w-full bg-warm-ivory/50 border border-outline-variant/30 px-3 py-2 text-xs font-semibold text-primary rounded-none">
                    {currentUser.name}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="font-label-caps text-[10px] text-secondary tracking-widest uppercase">Email Address</span>
                  <div className="w-full bg-warm-ivory/50 border border-outline-variant/30 px-3 py-2 text-xs font-semibold text-primary rounded-none overflow-x-auto whitespace-nowrap">
                    {currentUser.email}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="subject-select" className="font-label-caps text-[10px] text-secondary tracking-widest uppercase">Inquiry Type</label>
                <select
                  id="subject-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-transparent border border-outline focus:border-primary focus:ring-0 px-3 py-2.5 text-xs text-primary rounded-none"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Sizing & Fit Advice">Sizing & Fit Advice</option>
                  <option value="Order Status & Delivery">Order Status & Delivery</option>
                  <option value="Returns & Exchanges">Returns & Exchanges</option>
                  <option value="Customizations">Bespoke / Custom Request</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="message-textarea" className="font-label-caps text-[10px] text-secondary tracking-widest uppercase">Message</label>
                <textarea
                  id="message-textarea"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you with our hand-loomed heritage garments today?"
                  className="w-full bg-transparent border border-outline focus:border-primary focus:ring-0 p-3 text-xs text-primary rounded-none resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white font-label-caps text-[11px] py-4 tracking-widest hover:bg-muted-terracotta transition-colors uppercase disabled:opacity-50"
              >
                {isSubmitting ? 'SUBMITTING SECURELY...' : 'SUBMIT SECURE INQUIRY'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
