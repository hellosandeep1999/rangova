import React, { useState, useEffect, useRef } from 'react';

const HERO_SLIDES = [
  {
    img: 'https://lh3.googleusercontent.com/aida/ADBb0uhr49XTMjgFA5Q_UWWXRj1as2GqzGDTGBO17BYHstsY2y9e4VVz7rFebJfgOu6R_MfM3FaerXZ4CyNwQMWsBb-IUYOGYJLpaazVj1nKCjrFCao_4epboLVmUMCsnnMguo5N0cAhs641ty3l6h-O2PyD4w0Z7-tRioi4lDkHOHv7hbkyhaIDYE_L1Hcx5iMz227rK9vYhEoyoRDoaP7ndLN_yg7CWt48gSGwLvLsot-xNrgyO0vIzHrs',
    headline: 'Modern Tradition',
    sub: 'Ancestral Craft, Contemporary Grace',
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuNw8hYoPckUEXbG1HurK3uNM3wR7cxf3-bytxiD-n9GjebK5kK5BaEEj1hmExCSi7fCh3zj96WwQYd9WjKSk4iGI112LaFgpplgQqiIjVW1fNDJhra9mBHlTwvfxf6ZNolxteYCDcqVq98c9_kFo6IO2ZjEbvHeFyVZC37me6TAEFtm8s80GwypZENuqWFefTcG0jobmWHxhWON9Se9zPDy8Hflk3kpJRvTY_pFEEyQeu_6RS3tRjKrW-pLFbbludN0h1uyNp0Q',
    headline: 'The Jaipur Edit',
    sub: 'Hand-loomed Ahimsa Silk, Reimagined',
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCl1HPXFCnM0MqV24xsmv_tpPOygjO3cbY_mVQmnrBc_a6iEH5m_Qo5_4RHv6EAOLLnfOS-8qCU179yBRE7mlNZp4nn2AAc9vACw7DilmlON36SK5zknpLQ558EcC8EsRktJm06EG2Qy9lMN1-2Te4A3DnFaMQ1dWmBruvgNjQMNLcHmwwWk_fIbc1rDLQ25QqoGnc3AP9FZCuiblM_iTA7vgiaP-kKMKasI1XUXJvBfxd898gsxNUB_R0cXB6IDa_wIK5mdpoIEQ',
    headline: 'Born in Jaipur',
    sub: 'Dust, Craft & Quiet Luxury',
  },
];

const CATEGORIES = [
  { title: 'Co-ords',  idx: '01', img: 'https://lh3.googleusercontent.com/aida/ADBb0ugk91uMet-3VnW2R6iGpTl_yEcn2JHZWLwtILh3ope71QZ9hwsprV-cg3o8dJPjDR2X6xKTqeqM5NiBGITXBkqQYLxhCtDFMS449FEjuFeFnnEWeYDZiWvawZLK7Opb_JkJWsvD73pqqC4UgaG12JkrRofSRG7G4LZJqV0hIu9ixsKedmHrOsBT8tj1WnqmAthsRHBPKAx-N9yc6HG0eXBsXRn6ruhbdb7eyEHw0PN1VBIKdwd0scj7_A' },
  { title: 'Dresses',  idx: '02', img: 'https://lh3.googleusercontent.com/aida/ADBb0ugYGboZgWz32IDgG53pkXDhgNdUZFaFOjcja6nLntZTykYzrg8QrY9SJnZm1ii8aCHkjSv1IS0-trIE7HD27TsZRcwwAPQlBmzPZaMkHlIgZ8oo98o3YWsNbfqnS73ZtVxa9bOOLEZYdFjBqH3MD5skpPthtRQKx-4wlPRxPcHQ4WFqeFGrssrCnRmcuxXJmCLIaJ6XhZqDI7meNZWkp-wNg0lFQ78LuFmzay7xd6CDcHYKed2QVrD9' },
  { title: 'Shirts',   idx: '03', img: 'https://lh3.googleusercontent.com/aida/ADBb0ujKEAgF3tjBMIMFSdKuFMYTIWfbih_A2khRTp-nsiLwXFgyqKuzEW_pZ0AP_RXDal5H9BRcvSkxz73r0d3VULeOnEdBaQXHsWyFSI-Ix2VoRl3cE57oZmiyEZDDmjArfV4L0-9VHyPRqf5T7NpXg10sNLkQSkkBxVSKCrCQKRmub1LA3B5t21FgmT9RpzQZzoZyhBF3LeJDSvinxE9HcSRyMwsyuRjHFcFRyH-Ol1J9CGn7WYpQB4Dhgw' },
  { title: 'Skirts',   idx: '04', img: 'https://lh3.googleusercontent.com/aida/ADBb0uhM6Pq6vNQH2-aiTRcQNt1HTfmCIfolJs5WvRnRPCPcLGATDpsu7jjYK0GiLiLEMsjAb0AeJ-DRGIOdWAXsQ9hFdp1sCgHERVw5uOEnLmW67zDH55sKWMsuJ1ds6g84YJ0wECPAsRfPdo3Pi8cX4SGCFqr2qki2oHe587igji9tKX3vIU0aARxiTRBfzpfyoVdTaGWH2z-hpBhytnOO82IUYgQuL53YtRLBkdGgRhkDZiiyPbErAEi8LQ' },
  { title: 'Tops',     idx: '05', img: 'https://lh3.googleusercontent.com/aida/ADBb0ugjDUxBKpvtbeftQMJvQjNkJA9T8YwSfO1hnezXA57ehNdRXVwuoANKG_VxBlRWsJ41-WZeQg1GnEJ4uSVWSmeTEw-skEkgRZzBCrQBrUE3eLRPwTEUD9X22aGU6saxZCz9kdYwnXwdP15IZeW1eSnW_Vr1Eyi-vPnRM3w7o9OVyAL6niv4RcElvJqEeh8kGN1W9tEr6roqE9v0CCnnpI1Rvte5_n0-wMH8h-BUhYXRyXJpgK5w830G2w' },
];

const TESTIMONIALS = [
  {
    name: 'Maya T.',
    role: 'Architect',
    quote: '"The tailoring is impeccable, but it\'s the fabric that feels alive. Wearing this set feels like stepping into a piece of art that understands movement."',
    face: 'https://lh3.googleusercontent.com/aida/ADBb0uiif2rIlNDpO5fwoP2K_m1Smk9XB_R3QW-M-H98VGFKHYDGUog6QV8CTKcvKI7odfPg1cSKOL2gGgksdDtX087VXrFigMJomUzbXih_nZhqmV5za2l_N6XbDv1_a1PKWfRoHW04SVdtD_OfHRp5YOBwpFr4BXe1TWAJ_sUJ2IBOVgL0n7XPEAEZ38Ien61p8A6VFmnlBg1n3PjOZhXQ-vAFEL-p7PwqITii9nHTS830M-yZ5epJFIoH3Q'
  },
  {
    name: 'Priya S.',
    role: 'Curator',
    quote: '"I appreciate the silence of the design. It doesn\'t shout, but the quality of the block print demands attention. Truly heirloom pieces."',
    face: 'https://lh3.googleusercontent.com/aida/ADBb0ujZl2JB_RqrpgzRguTaNs2fBtmUdlyttv_qf8o5DcAZB9ik4Tgs_kt0s74KpZJGEH6SCkzibT9e4aoEx8QIiz3UdiSCOFTj0OgMVWHCIWbX1ui0cm_nsfH5GqCs9nyUexdIVrjNuwxAYN0aLHJxdce-hm-wYM8ZMaZDyFkL9o1vWYozmV19DZxWYqKIp_uvBNRCtsgcpGY7AM1bAIJf3f9eRn-lg6XvxVw7SGqFSYIoxVbNKQpJ7DDASg'
  },
  {
    name: 'Ananya R.',
    role: 'Designer',
    quote: '"Every time I wear a Rangova piece I feel connected to something ancient and timeless. The block prints tell stories that words cannot."',
    face: 'https://lh3.googleusercontent.com/aida/ADBb0uiif2rIlNDpO5fwoP2K_m1Smk9XB_R3QW-M-H98VGFKHYDGUog6QV8CTKcvKI7odfPg1cSKOL2gGgksdDtX087VXrFigMJomUzbXih_nZhqmV5za2l_N6XbDv1_a1PKWfRoHW04SVdtD_OfHRp5YOBwpFr4BXe1TWAJ_sUJ2IBOVgL0n7XPEAEZ38Ien61p8A6VFmnlBg1n3PjOZhXQ-vAFEL-p7PwqITii9nHTS830M-yZ5epJFIoH3Q'
  }
];

// Fashion reels using auto-play looping videos (portrait 9:16)
// Using Pexels free CDN videos (CC0 / royalty-free)
const FASHION_REELS = [
  { src: 'https://videos.pexels.com/video-files/7214090/7214090-sd_360_640_25fps.mp4', label: 'Block Print Walk' },
  { src: 'https://videos.pexels.com/video-files/8285503/8285503-sd_360_640_25fps.mp4', label: 'Silk Trench' },
  { src: 'https://videos.pexels.com/video-files/6389087/6389087-sd_360_640_25fps.mp4', label: 'Summer Collection' },
  { src: 'https://videos.pexels.com/video-files/6231808/6231808-sd_360_640_25fps.mp4', label: 'Tiered Skirt' },
  { src: 'https://videos.pexels.com/video-files/5386771/5386771-sd_360_640_25fps.mp4', label: 'Studio Prep' },
  { src: 'https://videos.pexels.com/video-files/4754961/4754961-sd_360_640_25fps.mp4', label: 'Heritage Craft' },
];

const TEAM_REELS = [
  { src: 'https://videos.pexels.com/video-files/4098942/4098942-sd_360_640_25fps.mp4', label: 'Artisan Dyeing' },
  { src: 'https://videos.pexels.com/video-files/4098940/4098940-sd_360_640_25fps.mp4', label: 'Block Printing' },
  { src: 'https://videos.pexels.com/video-files/3687757/3687757-sd_360_640_25fps.mp4', label: 'Loom Weaving' },
  { src: 'https://videos.pexels.com/video-files/4098943/4098943-sd_360_640_25fps.mp4', label: 'Finishing Touches' },
  { src: 'https://videos.pexels.com/video-files/4098941/4098941-sd_360_640_25fps.mp4', label: 'Quality Check' },
  { src: 'https://videos.pexels.com/video-files/4098942/4098942-sd_360_640_25fps.mp4', label: 'Packing & Care' },
];

export default function Home({ navigateTo, setCategoryFilter, addToCart, PRODUCTS, viewProductDetails }) {
  const [heroIdx, setHeroIdx] = useState(0);
  const heroTimer = useRef(null);
  const catRef = useRef(null);

  // Auto-slide hero
  useEffect(() => {
    heroTimer.current = setInterval(() => {
      setHeroIdx(i => (i + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(heroTimer.current);
  }, []);

  // Auto-scroll categories smoothly every 2.5 seconds
  useEffect(() => {
    const el = catRef.current;
    if (!el) return;
    let direction = 1;
    const interval = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 5) direction = -1;
      if (el.scrollLeft <= 5) direction = 1;
      el.scrollBy({ left: direction * 170, behavior: 'smooth' });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* ── Hero Carousel (no prev/next buttons, reduced height) ── */}
      <section className="relative w-full h-[52vh] md:h-[68vh] overflow-hidden bg-surface-container">
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === heroIdx ? 1 : 0, zIndex: i === heroIdx ? 1 : 0 }}
          >
            <img
              alt={slide.headline}
              className="w-full h-full object-cover object-center"
              src={slide.img}
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <span className="font-label-caps text-[11px] text-dusty-gold tracking-[0.3em] uppercase mb-3 block opacity-90">
                {slide.sub}
              </span>
              <h1 className="font-display-lg text-[32px] md:text-[64px] text-white mb-6 leading-none tracking-tight">
                {slide.headline}
              </h1>
              <button
                onClick={() => navigateTo('shop')}
                className="bg-white/90 backdrop-blur-sm text-primary font-label-caps text-label-caps px-8 py-3 uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-300 border-none text-[11px]"
              >
                Explore Collection
              </button>
            </div>
          </div>
        ))}

        {/* Dot indicators only — no prev/next arrows */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setHeroIdx(i); clearInterval(heroTimer.current); }}
              className={`h-1.5 rounded-full transition-all duration-300 border-none cursor-pointer ${i === heroIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {/* ── Curated Categories (auto-scrolls, no buttons, bigger cards) ── */}
      <section className="pt-10 md:pt-14 px-0">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-5">
          <span className="font-label-caps text-label-caps text-muted-terracotta tracking-[0.2em] mb-2 uppercase block text-[10px]">Discover Our World</span>
          <h2 className="font-headline-xl text-[24px] md:text-[38px] text-primary">Curated Categories</h2>
        </div>

        {/* Scrollable carousel — no sidebar buttons */}
        <div
          ref={catRef}
          className="flex gap-5 md:gap-7 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-margin-mobile md:px-margin-desktop pb-10"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => { setCategoryFilter(cat.title); navigateTo('shop'); }}
              className="group flex flex-col items-center cursor-pointer text-center bg-transparent border-none p-0 snap-start flex-shrink-0"
              style={{ width: '175px', minWidth: '160px' }}
            >
              <div className="relative w-full aspect-[3/4] rounded-t-full overflow-hidden mb-3 shadow-md group-hover:shadow-xl transition-all duration-500">
                <img
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={cat.img}
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <span className="font-label-caps text-[9px] text-muted-terracotta mb-0.5 tracking-widest">{cat.idx}</span>
              <span className="font-headline-sm text-[17px] md:text-[20px] text-primary group-hover:text-muted-terracotta transition-colors duration-300">
                {cat.title}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Must-Have Sets ── */}
      <section className="bg-surface-alt py-10 md:py-14">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div className="text-left">
              <h2 className="font-headline-xl text-[26px] md:text-[40px] text-primary mb-2">Must-Have Sets</h2>
              <p className="font-body-md text-sm text-secondary max-w-md">Elevate your everyday wardrobe with our signature block print sets.</p>
            </div>
            <button
              onClick={() => { setCategoryFilter('Co-ords'); navigateTo('shop'); }}
              className="font-label-caps text-[11px] text-primary border-0 border-b border-primary pb-0.5 hover:text-muted-terracotta hover:border-muted-terracotta transition-colors duration-300 uppercase bg-transparent tracking-widest flex-shrink-0"
            >
              View All Sets
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {PRODUCTS.slice(0, 6).map((prod) => (
              <div
                key={prod.id}
                onClick={() => {
                  viewProductDetails(prod.id);
                }}
                className="product-card group relative cursor-pointer text-left"
              >
                <div className="relative aspect-[3/4] overflow-hidden mb-2 md:mb-3 bg-surface-container-low">
                  <img alt={prod.title} className="product-img product-img-main absolute inset-0 w-full h-full object-cover object-top z-10" src={prod.imageMain} />
                  <img alt={prod.title} className="product-img product-img-hover absolute inset-0 w-full h-full object-cover object-top z-0 opacity-0" src={prod.imageHover} />
                  {prod.badge && (
                    <div className="absolute top-2 left-2 z-20">
                      <span className="bg-soft-beige px-2 py-0.5 font-label-caps text-[9px] text-primary uppercase tracking-widest">{prod.badge}</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(prod, prod.sizes?.[0] || 'S', prod.colors?.[0] || ''); }}
                    className="absolute bottom-2 right-2 z-20 w-8 h-8 bg-primary text-white flex items-center justify-center hover:bg-muted-terracotta transition-colors duration-200 shadow-md border-none"
                    title="Quick Add"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>

                <div className="flex flex-col px-0.5">
                  <h3 className="font-body-md text-[12px] md:text-[14px] text-primary mb-1 group-hover:text-muted-terracotta transition-colors duration-300 leading-snug">{prod.title}</h3>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-price-lg text-[13px] md:text-[15px] text-primary">₹{prod.price.toLocaleString()}</span>
                    {prod.originalPrice && (
                      <span className="font-body-md text-[10px] text-secondary line-through">₹{prod.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                  {prod.colorsHex && (
                    <div className="flex gap-1.5 items-center flex-wrap">
                      {Object.entries(prod.colorsHex).map(([name, hex]) => (
                        <span key={name} title={name} className="w-3 h-3 rounded-full border border-outline/30 inline-block flex-shrink-0" style={{ backgroundColor: hex }} />
                      ))}
                      <span className="text-[10px] text-secondary ml-1">
                        {Object.keys(prod.colorsHex).length} colour{Object.keys(prod.colorsHex).length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={() => navigateTo('shop')}
              className="font-label-caps text-[11px] tracking-widest uppercase border border-primary text-primary px-10 py-3 hover:bg-primary hover:text-white transition-all duration-300 bg-transparent"
            >
              View Full Collection
            </button>
          </div>
        </div>
      </section>

      {/* ── Fashion Reels Section — auto-playing looping vertical video tiles ── */}
      <section className="py-10 md:py-14 bg-warm-ivory">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-6">
          <span className="font-label-caps text-[10px] text-muted-terracotta tracking-[0.25em] uppercase mb-2 block">Style in Motion</span>
          <h2 className="font-headline-xl text-[24px] md:text-[38px] text-primary">Fashion Reels</h2>
        </div>

        <div
          className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-margin-mobile md:px-margin-desktop pb-2"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {FASHION_REELS.map((reel, i) => (
            <div
              key={i}
              className="relative flex-shrink-0 snap-start overflow-hidden group"
              style={{ width: '150px', minWidth: '138px' }}
            >
              <div className="relative rounded-lg overflow-hidden" style={{ aspectRatio: '9/16' }}>
                <video
                  src={reel.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                <div className="absolute bottom-3 left-2.5 right-2.5">
                  <p className="font-label-caps text-[9px] text-white tracking-wider uppercase leading-tight">{reel.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Team Working Reels — continuously scrolling marquee ── */}
      <section className="py-10 md:py-12 bg-primary overflow-hidden">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-6">
          <span className="font-label-caps text-[10px] text-dusty-gold tracking-[0.25em] uppercase mb-2 block">Behind the Craft</span>
          <h2 className="font-headline-xl text-[24px] md:text-[38px] text-white">Team Working Reels</h2>
        </div>

        {/* Infinite-scroll marquee — duplicated for seamless loop */}
        <div className="flex overflow-hidden" aria-hidden="true">
          <div
            className="flex gap-3 flex-shrink-0"
            style={{
              animation: 'marqueeScroll 28s linear infinite',
            }}
          >
            {[...TEAM_REELS, ...TEAM_REELS].map((reel, i) => (
              <div
                key={i}
                className="relative flex-shrink-0 overflow-hidden rounded-lg"
                style={{ width: '130px', minWidth: '130px' }}
              >
                <div className="relative" style={{ aspectRatio: '9/16' }}>
                  <video
                    src={reel.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-2.5 right-2.5">
                    <p className="font-label-caps text-[8px] text-white/90 tracking-wider uppercase leading-tight">{reel.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Voice of Rangova (scrollable, no buttons) ── */}
      <section className="py-10 md:py-14 bg-white overflow-hidden">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-6">
          <span className="font-label-caps text-[10px] text-muted-terracotta tracking-[0.25em] uppercase mb-2 block">Customer Stories</span>
          <h2 className="font-headline-xl text-[24px] md:text-[38px] text-primary">Voice of Rangova</h2>
        </div>

        {/* Scrollable horizontal carousel — no buttons */}
        <div
          className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-margin-mobile md:px-margin-desktop pb-4"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="flex-shrink-0 snap-start" style={{ width: 'min(88vw, 460px)' }}>
              <div className="bg-warm-ivory border border-outline-variant/20 flex flex-col sm:flex-row gap-0 overflow-hidden h-full">
                <div className="w-full sm:w-36 md:w-44 flex-shrink-0">
                  <img
                    src={t.face}
                    alt={t.name}
                    className="w-full h-40 sm:h-full object-cover object-center"
                    style={{ minHeight: '160px', maxHeight: '220px' }}
                  />
                </div>
                <div className="flex flex-col justify-center p-5 md:p-6 flex-1">
                  <span className="text-muted-terracotta text-3xl leading-none font-headline-sm block mb-2">"</span>
                  <p className="font-body-lg text-[13px] md:text-[15px] text-primary italic mb-4 leading-relaxed">{t.quote}</p>
                  <div>
                    <span className="font-label-caps text-[11px] text-primary uppercase tracking-widest block font-bold">— {t.name}</span>
                    <span className="font-label-caps text-[10px] text-secondary uppercase tracking-widest">{t.role}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Brand Spread ── */}
      <section className="w-full h-[28vh] md:h-[38vh] relative">
        <img alt="Brand overlay" className="w-full h-full object-cover object-center" src={HERO_SLIDES[0].img} />
        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-display-lg text-[10vw] text-white/20 tracking-tighter mix-blend-overlay">RANGOVA</span>
        </div>
      </section>
    </div>
  );
}
