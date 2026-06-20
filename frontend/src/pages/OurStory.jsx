import React from 'react';

export default function OurStory({ navigateTo }) {
  return (
    <div className="pb-16">

      {/* Hero */}
      <section className="relative w-full h-[55vh] min-h-[340px] flex items-end pb-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-left">
        <div className="absolute inset-0 w-full h-full p-4 md:p-6">
          <div className="w-full h-full bg-primary rounded-sm grayscale-[20%]" />
          <div className="absolute inset-4 md:inset-6 bg-gradient-to-t from-primary/70 via-transparent to-transparent rounded-sm" />
        </div>
        <div className="relative z-10 w-full md:w-8/12 lg:w-6/12 pb-6 px-4 md:px-6 text-on-primary">
          <span className="font-label-caps text-[10px] uppercase tracking-widest text-dusty-gold mb-2 block">Our Heritage</span>
          <h1 className="font-display-lg text-[30px] md:text-[52px] leading-tight mb-3 text-white">Born from the dust of Jaipur.</h1>
          <p className="font-body-lg text-sm md:text-base text-white/90 max-w-md">We exist at the intersection of ancestral Indian craftsmanship and contemporary minimalism. A quiet revolt against fast fashion.</p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-14 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-left">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
          <div className="md:col-span-5 md:col-start-2 order-2 md:order-1 mt-8 md:mt-0">
            <h2 className="font-headline-xl text-[26px] md:text-[40px] text-primary mb-6">The Philosophy of Quiet Craft</h2>
            <p className="font-body-lg text-sm md:text-base text-on-surface-variant mb-5 leading-relaxed">
              True luxury whispers; it does not shout. At Rangova, we believe that the most profound beauty is found in the meticulous, unseen hours of creation. Our philosophy centers on reducing noise, stripping away the superfluous, and allowing the raw integrity of hand-woven textiles to command the space.
            </p>
            <p className="font-body-md text-sm text-on-surface-variant mb-7 leading-relaxed">
              Every garment begins as an idea in our studio, before journeying to the desert villages where it is touched by dozens of skilled hands. We do not design for seasons; we design for generations.
            </p>
            <button
              onClick={() => navigateTo('shop')}
              className="inline-flex items-center gap-2 font-label-caps text-[11px] text-primary uppercase border-0 border-b border-primary pb-1 hover:text-dusty-gold hover:border-dusty-gold transition-colors duration-300 bg-transparent font-bold tracking-widest"
            >
              Explore Our Materials
              <span className="material-symbols-outlined text-[16px]">arrow_right_alt</span>
            </button>
          </div>
          <div className="md:col-span-5 md:col-start-8 order-1 md:order-2">
            <div className="relative w-full aspect-[3/4] bg-surface-container-low shadow-sm">
              <div className="absolute inset-0 w-full h-full bg-surface-variant" />
            </div>
          </div>
        </div>
      </section>

      {/* Blockquote */}
      <section className="bg-surface-container-low py-14 px-margin-mobile md:px-margin-desktop text-center">
        <div className="max-w-4xl mx-auto">
          <span className="material-symbols-outlined text-dusty-gold text-4xl mb-4" style={{ fontVariationSettings: '"FILL" 1' }}>format_quote</span>
          <blockquote className="font-headline-xl text-[22px] md:text-[36px] text-primary leading-snug italic mb-5">
            "We are not merely making clothes; we are preserving the cadence of a centuries-old heartbeat."
          </blockquote>
          <div className="font-label-caps text-[10px] text-secondary uppercase tracking-widest">— The Rangova Design Studio</div>
        </div>
      </section>

      {/* Artisans */}
      <section className="py-14 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-left">
        <div className="max-w-2xl mb-10">
          <span className="font-label-caps text-[10px] text-dusty-gold uppercase tracking-widest block mb-2">Our Artisans</span>
          <h2 className="font-headline-xl text-[26px] md:text-[40px] text-primary mb-3">The Families of Bagru</h2>
          <p className="font-body-lg text-sm md:text-base text-on-surface-variant">Thirty kilometers east of Jaipur lies Bagru, a village where the air smells of indigo and wet earth. Here, the art of block printing is not an industry; it is an inheritance.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <div className="md:col-span-7 flex flex-col group">
            <div className="w-full aspect-[4/3] bg-surface-container overflow-hidden mb-4 relative">
              <div className="w-full h-full bg-surface-variant transition-transform duration-700 group-hover:scale-105" />
            </div>
            <h3 className="font-headline-sm text-lg md:text-[22px] text-primary mb-2">Master Dyer, Ram Kishore</h3>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">A third-generation artisan, Ram Kishore oversees the natural fermentation of our indigo vats, a process that takes days of precise observation.</p>
          </div>
          <div className="md:col-span-5 flex flex-col justify-end">
            <div className="group">
              <div className="w-full aspect-square bg-surface-container overflow-hidden mb-4">
                <div className="w-full h-full bg-surface-variant transition-transform duration-700 group-hover:scale-105" />
              </div>
              <h3 className="font-headline-sm text-lg md:text-[22px] text-primary mb-2">The Carvers</h3>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">Using teak wood, our carvers translate complex geometric sketches into tactile stamps, precise to the millimeter.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
