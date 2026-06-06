import React, { useState } from 'react';

export default function Policies({ navigateTo }) {
  const [activeTab, setActiveTab] = useState('shipping');

  return (
    <div className="w-full min-h-[85vh] bg-warm-ivory py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-left animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="font-label-caps text-label-caps text-muted-terracotta tracking-widest block mb-2">Legal & Logistics</span>
          <h1 className="font-display-lg text-3xl md:text-4xl font-bold tracking-tight text-primary uppercase mb-6">Boutique Policies</h1>
          
          {/* Tab buttons */}
          <div className="flex justify-center gap-6 border-b border-outline-variant/30 pb-px">
            <button
              onClick={() => setActiveTab('shipping')}
              className={`font-label-caps text-xs tracking-wider pb-3 transition-all relative border-none bg-transparent cursor-pointer ${activeTab === 'shipping' ? 'text-primary font-bold' : 'text-secondary hover:text-primary'}`}
            >
              Shipping & Returns
              {activeTab === 'shipping' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
            </button>
            <button
              onClick={() => setActiveTab('tos')}
              className={`font-label-caps text-xs tracking-wider pb-3 transition-all relative border-none bg-transparent cursor-pointer ${activeTab === 'tos' ? 'text-primary font-bold' : 'text-secondary hover:text-primary'}`}
            >
              Terms of Service
              {activeTab === 'tos' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-surface border border-outline-variant/30 p-8 md:p-12 shadow-sm font-body-md text-secondary leading-relaxed space-y-6">
          {activeTab === 'shipping' ? (
            <div className="space-y-6">
              <h2 className="font-display-lg text-xl font-bold text-primary uppercase tracking-wider mb-4 border-b border-outline-variant/20 pb-2">Shipping & Returns</h2>
              
              <section className="space-y-2">
                <h3 className="font-bold text-primary text-sm uppercase tracking-wide">Complimentary Shipping</h3>
                <p>
                  Rangova offers complimentary standard shipping within India on all orders. Each garment is handcrafted upon order confirmation and will be dispatched within 4–7 business days. Express shipping options are available at checkout.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-primary text-sm uppercase tracking-wide">Carbon-Neutral Packaging</h3>
                <p>
                  In line with our preservation ethos, all Rangova packages are shipped in plastic-free, carbon-neutral bespoke linen wraps and post-consumer recycled boxes.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-primary text-sm uppercase tracking-wide">Bespoke Return & Exchange Policy</h3>
                <p>
                  We accept returns and size exchanges on unworn, unaltered garments in original packaging within 14 days of delivery. As we craft limited-edition heritage items, custom-tailored orders are ineligible for standard returns, though minor fitting adjustments can be made through our concierge service.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-primary text-sm uppercase tracking-wide">How to Initiate a Return</h3>
                <p>
                  Simply log into your dashboard, view your previous orders, or reach out to our client concierge via the <button onClick={() => navigateTo('contact')} className="text-muted-terracotta underline hover:opacity-80 inline-block font-semibold bg-transparent border-none p-0 cursor-pointer">Contact Page</button> to request a complimentary home collection.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="font-display-lg text-xl font-bold text-primary uppercase tracking-wider mb-4 border-b border-outline-variant/20 pb-2">Terms of Service</h2>
              
              <p className="text-xs italic text-secondary/70">Last Updated: May 30, 2026</p>

              <section className="space-y-2">
                <h3 className="font-bold text-primary text-sm uppercase tracking-wide">1. Agreement to Terms</h3>
                <p>
                  By accessing the Rangova boutique, you agree to comply with and be bound by these Terms of Service. If you do not agree, please discontinue use immediately.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-primary text-sm uppercase tracking-wide">2. Artisanal Variance</h3>
                <p>
                  Our garments feature natural hand-block prints and vegetable dyes. Minor variations in dye concentration, printing spacing, and weaving texture are inherent characteristics of traditional heritage crafts and do not qualify as structural defects.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-primary text-sm uppercase tracking-wide">3. Intellectual Property</h3>
                <p>
                  All content, photography, graphics, logo marks, and proprietary fabric designs presented on this site are the exclusive intellectual property of Rangova Boutique and partners.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-primary text-sm uppercase tracking-wide">4. Limitation of Liability</h3>
                <p>
                  Rangova shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our website or purchase of handcrafted items.
                </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
