import React, { useState, useEffect, useRef } from 'react';
import { getSetting, getTestimonials } from '../lib/api';
import { HeroSkeleton, CategoryCardSkeleton, ProductCardSkeleton, TestimonialSkeleton } from '../components/Skeleton';


const HERO_SLIDES = [
  {
    img: '',
    headline: 'Modern Tradition',
    sub: 'Ancestral Craft, Contemporary Grace',
  },
  {
    img: '',
    headline: 'The Jaipur Edit',
    sub: 'Hand-loomed Ahimsa Silk, Reimagined',
  },
  {
    img: '',
    headline: 'Born in Jaipur',
    sub: 'Dust, Craft & Quiet Luxury',
  },
];

const TESTIMONIALS = [
  {
    name: 'Maya T.',
    role: 'Architect',
    quote: '"The tailoring is impeccable, but it\'s the fabric that feels alive. Wearing this set feels like stepping into a piece of art that understands movement."',
    face: ''
  },
  {
    name: 'Priya S.',
    role: 'Curator',
    quote: '"I appreciate the silence of the design. It doesn\'t shout, but the quality of the block print demands attention. Truly heirloom pieces."',
    face: ''
  },
  {
    name: 'Ananya R.',
    role: 'Designer',
    quote: '"Every time I wear a Rangova piece I feel connected to something ancient and timeless. The block prints tell stories that words cannot."',
    face: ''
  }
];

export default function Home({ navigateTo, setCategoryFilter, addToCart, PRODUCTS, CATEGORIES, viewProductDetails }) {
  const [heroSlides, setHeroSlides] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [fashionReels, setFashionReels] = useState([]);
  const [teamReels, setTeamReels] = useState([]);
  const [brandOverlay, setBrandOverlay] = useState(HERO_SLIDES[0].img);
  const [heroIdx, setHeroIdx] = useState(0);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [heroData, testData, fashionData, teamData, overlayData] = await Promise.all([
          getSetting('hero_slides').catch(() => null),
          getTestimonials().catch(() => null),
          getSetting('fashion_reels').catch(() => null),
          getSetting('team_reels').catch(() => null),
          getSetting('brand_overlay_image').catch(() => null)
        ]);
        if (heroData) {
          let parsed = typeof heroData === 'string' ? JSON.parse(heroData) : heroData;
          if (typeof parsed === 'string') parsed = JSON.parse(parsed);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHeroSlides(parsed);
          } else {
            setHeroSlides(HERO_SLIDES);
          }
        } else {
          setHeroSlides(HERO_SLIDES);
        }
        if (testData && testData.length > 0) setTestimonials(testData);
        if (fashionData) {
          let parsed = typeof fashionData === 'string' ? JSON.parse(fashionData) : fashionData;
          if (typeof parsed === 'string') parsed = JSON.parse(parsed);
          if (Array.isArray(parsed) && parsed.length > 0) setFashionReels(parsed);
        }
        if (teamData) {
          let parsed = typeof teamData === 'string' ? JSON.parse(teamData) : teamData;
          if (typeof parsed === 'string') parsed = JSON.parse(parsed);
          if (Array.isArray(parsed) && parsed.length > 0) setTeamReels(parsed);
        }
        if (overlayData) setBrandOverlay(overlayData);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setHeroSlides(HERO_SLIDES);
        setTestimonials(TESTIMONIALS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const heroRef = useRef(null);
  const heroTimer = useRef(null);
  const isUserScrolling = useRef(false);
  const catRef = useRef(null);

  // Auto-advance hero via scroll
  useEffect(() => {
    const startAutoPlay = () => {
      heroTimer.current = setInterval(() => {
        if (isUserScrolling.current) return;
        const el = heroRef.current;
        if (!el) return;
        const slideWidth = el.clientWidth;
        const nextIdx = (heroIdx + 1) % heroSlides.length;
        el.scrollTo({ left: nextIdx * slideWidth, behavior: 'smooth' });
      }, 4500);
    };
    startAutoPlay();
    return () => clearInterval(heroTimer.current);
  }, [heroIdx, heroSlides]);

  // Sync dot index from scroll position
  const handleHeroScroll = (e) => {
    const el = e.target;
    const slideWidth = el.clientWidth;
    if (slideWidth > 0) {
      const idx = Math.round(el.scrollLeft / slideWidth);
      if (idx !== heroIdx) setHeroIdx(idx);
    }
  };

  // When user taps a dot — scroll to that slide
  const scrollToSlide = (i) => {
    clearInterval(heroTimer.current);
    const el = heroRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
    setHeroIdx(i);
  };

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

  // Lazy load sections on scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    const hiddenElements = document.querySelectorAll('.reveal-on-scroll');
    hiddenElements.forEach((el) => observer.observe(el));

    return () => {
      hiddenElements.forEach((el) => observer.unobserve(el));
    };
  }, [fashionReels, teamReels, testimonials]);

  return (
    <div>
      {/* ── Hero Carousel — horizontal scroll-snap, touch-swipeable ── */}
      <section className="relative w-full h-[42vh] md:h-[58vh] bg-surface-container overflow-hidden">
        {/* Scrollable track */}
        <div
          ref={heroRef}
          onScroll={handleHeroScroll}
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
        >
          {loading || heroSlides.length === 0 ? (
            <div className="w-full h-full flex-shrink-0">
              <HeroSkeleton />
            </div>
          ) : heroSlides.map((slide, i) => (

            <div
              key={i}
              className="relative w-full h-full flex-shrink-0 snap-center snap-always"
            >
              <img
                alt={slide.headline}
                className="w-full h-full object-cover object-center"
                src={slide.img}
                draggable={false}
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
                <span className="font-label-caps text-[11px] text-dusty-gold tracking-[0.3em] uppercase mb-3 block opacity-90">
                  {slide.sub}
                </span>
                <h1 className="font-display-lg text-[32px] md:text-[64px] text-white mb-6 leading-none tracking-tight">
                  {slide.headline}
                </h1>
                <button
                  onClick={() => navigateTo('shop')}
                  className="bg-white/90 backdrop-blur-sm text-primary font-label-caps text-label-caps px-8 py-3 uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-300 border-none text-[11px] pointer-events-auto cursor-pointer"
                >
                  Explore Collection
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 border-none cursor-pointer ${i === heroIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {/* ── Curated Categories (auto-scrolls, no buttons, bigger cards) ── */}
      <section className="pt-10 md:pt-14 px-0 reveal-on-scroll">
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
          {(!CATEGORIES || CATEGORIES.length === 0) ? (
            <CategoryCardSkeleton count={5} />
          ) : CATEGORIES.map((cat, i) => (

            <button
              key={i}
              onClick={() => { setCategoryFilter(cat.name); navigateTo('shop'); }}
              className="group flex flex-col items-center cursor-pointer text-center bg-transparent border-none p-0 snap-start flex-shrink-0"
              style={{ width: '175px', minWidth: '160px' }}
            >
              <div className="relative w-full aspect-[3/4] rounded-t-full overflow-hidden mb-3 shadow-md group-hover:shadow-xl transition-all duration-500 bg-surface-container-low">
                {cat.image_url && (
                  <img
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={cat.image_url}
                  />
                )}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <span className="font-label-caps text-[9px] text-muted-terracotta mb-0.5 tracking-widest">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-headline-sm text-[17px] md:text-[20px] text-primary group-hover:text-muted-terracotta transition-colors duration-300">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Must-Have Sets ── */}
      <section className="bg-surface-alt py-10 md:py-14 reveal-on-scroll">
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
            {PRODUCTS.length === 0 ? (
              <ProductCardSkeleton count={6} />
            ) : PRODUCTS.slice(0, 10).map((prod) => (

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
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      let sz = prod.sizes?.[0] || 'S';
                      let col = prod.colors?.[0] || '';
                      if (prod.inventory?.length > 0) {
                        const avail = prod.inventory.find(inv => inv.stock_qty > 0);
                        if (avail) { sz = avail.size || sz; col = avail.color || col; }
                      }
                      addToCart(prod, sz, col); 
                    }}
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
      {fashionReels.length > 0 && (
        <section className="py-10 md:py-14 bg-warm-ivory reveal-on-scroll">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-6">
            <span className="font-label-caps text-[10px] text-muted-terracotta tracking-[0.25em] uppercase mb-2 block">Style in Motion</span>
            <h2 className="font-headline-xl text-[24px] md:text-[38px] text-primary">Fashion Reels</h2>
          </div>

          <div
            className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-margin-mobile md:px-margin-desktop pb-2"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {fashionReels.map((reel, i) => (
              <div
                key={i}
                className="relative flex-shrink-0 snap-start overflow-hidden group"
                style={{ width: '150px', minWidth: '138px' }}
              >
                <div className="relative rounded-lg overflow-hidden" style={{ aspectRatio: '9/16' }}>
                  <video
                    src={reel.src || reel.url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                  <div className="absolute bottom-3 left-2.5 right-2.5">
                    <p className="font-label-caps text-[9px] text-white tracking-wider uppercase leading-tight">{reel.label || reel.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Team Working Reels — continuously scrolling marquee ── */}
      {teamReels.length > 0 && (
        <section className="py-10 md:py-12 bg-primary overflow-hidden reveal-on-scroll">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-6">
            <span className="font-label-caps text-[10px] text-dusty-gold tracking-[0.25em] uppercase mb-2 block">Behind the Craft</span>
            <h2 className="font-headline-xl text-[24px] md:text-[38px] text-white">Team Working Reels</h2>
          </div>

          <div
            className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-margin-mobile md:px-margin-desktop pb-2"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {teamReels.map((reel, i) => (
              <div
                key={i}
                className="relative flex-shrink-0 overflow-hidden rounded-lg snap-start"
                style={{ width: '150px', minWidth: '138px' }}
              >
                <div className="relative" style={{ aspectRatio: '9/16' }}>
                  <video
                    src={reel.src || reel.url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-2.5 right-2.5">
                    <p className="font-label-caps text-[8px] text-white/90 tracking-wider uppercase leading-tight">{reel.label || reel.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Voice of Rangova (scrollable, no buttons) ── */}
      <section className="py-10 md:py-14 bg-white overflow-hidden reveal-on-scroll">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-6">
          <span className="font-label-caps text-[10px] text-muted-terracotta tracking-[0.25em] uppercase mb-2 block">Customer Stories</span>
          <h2 className="font-headline-xl text-[24px] md:text-[38px] text-primary">Voice of Rangova</h2>
        </div>

        {/* Scrollable horizontal carousel — no buttons */}
        <div
          className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-margin-mobile md:px-margin-desktop pb-4"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {loading ? (
            <TestimonialSkeleton count={2} />
          ) : testimonials.map((t, i) => (

            <div key={i} className="flex-shrink-0 snap-start" style={{ width: 'min(88vw, 460px)' }}>
              <div className="bg-warm-ivory border border-outline-variant/20 rounded-[15px] flex flex-col gap-4 p-4 overflow-hidden h-full">
                {/* Image row - horizontal on all screens */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <img
                      src={t.image_url || t.face}
                      alt={t.customer_name || t.name}
                      className="w-14 h-14 object-cover rounded-full border border-outline-variant/30"
                    />
                  </div>
                  <div>
                    <span className="font-label-caps text-[11px] text-primary uppercase tracking-widest block font-bold">{t.customer_name || t.name}</span>
                    <span className="font-label-caps text-[10px] text-secondary uppercase tracking-widest">{t.customer_position || t.role}</span>
                  </div>
                </div>
                {/* Quote */}
                <div className="flex-1">
                  <span className="text-muted-terracotta text-2xl leading-none font-headline-sm block mb-1">"</span>
                  <p className="font-body-lg text-[13px] text-primary italic leading-relaxed">{t.review || t.quote}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Brand Spread ── */}
      <section className="w-full relative reveal-on-scroll flex">
        <img alt="Brand overlay" className="w-full h-auto object-contain" src={brandOverlay} />
        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-display-lg text-[10vw] text-white/20 tracking-tighter mix-blend-overlay">RANGOVA</span>
        </div>
      </section>
    </div>
  );
}
