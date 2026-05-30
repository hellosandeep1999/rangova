import React from 'react';

export default function OurStory({ navigateTo }) {
  return (
    <div className="pb-16">

      {/* Hero */}
      <section className="relative w-full h-[55vh] min-h-[340px] flex items-end pb-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-left">
        <div className="absolute inset-0 w-full h-full p-4 md:p-6">
          <img
            alt="Jaipur Courtyard"
            className="w-full h-full object-cover rounded-sm grayscale-[20%]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCl1HPXFCnM0MqV24xsmv_tpPOygjO3cbY_mVQmnrBc_a6iEH5m_Qo5_4RHv6EAOLLnfOS-8qCU179yBRE7mlNZp4nn2AAc9vACw7DilmlON36SK5zknpLQ558EcC8EsRktJm06EG2Qy9lMN1-2Te4A3DnFaMQ1dWmBruvgNjQMNLcHmwwWk_fIbc1rDLQ25QqoGnc3AP9FZCuiblM_iTA7vgiaP-kKMKasI1XUXJvBfxd898gsxNUB_R0cXB6IDa_wIK5mdpoIEQ"
          />
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
              <img
                alt="Artisanal Handloom"
                className="absolute inset-0 w-full h-full object-cover object-center"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4urOMAi6_xtC2f3UuFsMrbezgUCqMYJoLB4Rrkrck0Dq8CbK_jj83WQzwMhAKzOVHmrIWFq5Dif1Y32JY6uFY0UY66nMY9nlD2-MB2WKMS6tATn_LqgzpRceZDcycSd9_ffHwwmvPyRRUl8Ekd-c8AGEgFuoGfLEWN7f8-AKnvVxBgg1k_UWUov33SYmBttm7bz5D5z5dbWJebGizTGB0AoLGMW0Iuy18KUXg5eJy_tebZaNO01mjgUlbN6nGd_BhbrQf8qve-Q"
              />
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
              <img
                alt="Indigo dipping"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNn_kDyBpPP4-Y7CEZISV5arNVqFMh-1D062CNqWHpVAg7iLQuY_yA18ebfCx_6AOaEuSATqxXtvHAqRpXD4rv39sSEz_Iea3ajkJbriBOrIFw_PqwsH1o6wKV72rNnshICyFbMFQ1COxODEjKo4XMfZrrVFYU3L3nsaf8t2f_E_J29BKPpL6F9jOzC_0y2lHF_7bnwVTj8wFerZa2AI-sLTvkJNChBcoG2cv1O5s5Al4rm-eXkAOUuz1RAOBtHvVhEDRIYvrW1A"
              />
            </div>
            <h3 className="font-headline-sm text-lg md:text-[22px] text-primary mb-2">Master Dyer, Ram Kishore</h3>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">A third-generation artisan, Ram Kishore oversees the natural fermentation of our indigo vats, a process that takes days of precise observation.</p>
          </div>
          <div className="md:col-span-5 flex flex-col justify-end">
            <div className="group">
              <div className="w-full aspect-square bg-surface-container overflow-hidden mb-4">
                <img
                  alt="Wooden Printing Block"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtSlE-XcFXCLyJ6O_b0z7IBomR1SyWJSPhHx2BSIuUET_6jm8AN-S_j_xDU7AWzoI-kaPPspqV_DoYyZPeXjBkeErXtdUdRlOHTViRuCmfNPGE8_F1sT_RxF0R3a-5X9XVmJjd5Sp1VTv1Y2lJp2qzhHqJcsc9LtcXsjt_XHP7J0OpuRKieXsGqFcMqgAuBXFhYB5SNK1nakxL7ZFEg3LOwgfKyqUAVo0DZi-VyhBeeI-hxb8KbqE-vrzoB2qxSR7DDS7RX2GWNw"
                />
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
