import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
// Using products passed as prop

export default function ProductDetails({ navigateTo, addToCart, selectedProductId, viewProductDetails, products = [] }) {
  // Find active product
  const prod = products.find(p => p.id === selectedProductId) || products[0] || {};

  // Default variant setup
  let initialColor = prod.colors?.[0] || 'Warm Ivory';
  let initialSize = prod.sizes?.[0] || 'S';
  if (prod.inventory?.length > 0) {
    const avail = prod.inventory.find(i => i.stock_qty > 0);
    if (avail) {
      initialColor = avail.color || initialColor;
      initialSize = avail.size || initialSize;
    }
  }

  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({ details: true, shipping: false });

  const currentInStock = (() => {
    if (!prod || !prod.inventory || prod.inventory.length === 0) return prod?.inStock ?? false;
    const invItem = prod.inventory.find(i => 
      (i.color || '').toLowerCase() === (selectedColor || '').toLowerCase() &&
      (i.size || '').toLowerCase() === (selectedSize || '').toLowerCase()
    );
    return invItem ? invItem.stock_qty > 0 : false;
  })();

  const carouselRef = useRef(null);

  // Sync color changes when product ID changes
  useEffect(() => {
    let defaultCol = prod.colors?.[0] || 'Warm Ivory';
    let defaultSize = prod.sizes?.[0] || 'S';
    if (prod.inventory?.length > 0) {
      const avail = prod.inventory.find(i => i.stock_qty > 0);
      if (avail) {
        defaultCol = avail.color || defaultCol;
        defaultSize = avail.size || defaultSize;
      }
    }
    setSelectedColor(defaultCol);
    setSelectedSize(defaultSize);
    setActiveImageIdx(0);
    setOpenAccordions({ details: true, shipping: false });
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
    }
    // Smoothly scroll the window to the top so the user sees the newly selected product
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedProductId, prod]);

  // Sync image index when color changes
  useEffect(() => {
    setActiveImageIdx(0);
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
    }
  }, [selectedColor]);

  // Extract color specific images
  const colorImages = (prod.imagesByColor && prod.imagesByColor[selectedColor] && prod.imagesByColor[selectedColor].length > 0)
    ? prod.imagesByColor[selectedColor]
    : [prod.imageMain, prod.imageHover].filter(Boolean);

  const handleThumbnailClick = (idx) => {
    setActiveImageIdx(idx);
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.clientWidth;
      carouselRef.current.scrollTo({
        left: idx * slideWidth,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.clientWidth;
    if (width > 0) {
      const idx = Math.round(scrollLeft / width);
      if (idx !== activeImageIdx) {
        setActiveImageIdx(idx);
      }
    }
  };

  // Recommendations: exclude current product
  const recommendations = products.filter(p => p.id !== prod.id);

  // Simulated original price if none exists to display the attractive crossed-out discount
  const originalPrice = prod.originalPrice || (prod.price ? Math.round(prod.price * 1.35) : 0);

  if (!prod.id) return <div className="p-10 text-center">Loading product...</div>;

  return (
    <div className="pt-6 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-left font-body-md relative">
      
      {/* Size Guide Modal Overlay */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsSizeGuideOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />
          <div className="relative bg-white max-w-lg w-full p-8 shadow-2xl border border-outline-variant/30 animate-fadeIn z-10 text-primary">
            <button 
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
            <h3 className="font-display-lg text-2xl font-bold tracking-tight mb-4 uppercase text-center">Size Guide</h3>
            <p className="text-xs text-secondary mb-6 text-center">Standard measurements in inches. If you are between sizes, we recommend selecting one size up.</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-primary/20 font-label-caps text-secondary text-[10px] tracking-wider">
                    <th className="py-3 pr-4">SIZE</th>
                    <th className="py-3 px-4">BUST</th>
                    <th className="py-3 px-4">WAIST</th>
                    <th className="py-3 px-4">HIPS</th>
                    <th className="py-3 pl-4">LENGTH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  <tr>
                    <td className="py-3 pr-4 font-bold">XS (8)</td>
                    <td className="py-3 px-4 text-secondary">32"</td>
                    <td className="py-3 px-4 text-secondary">26"</td>
                    <td className="py-3 px-4 text-secondary">35"</td>
                    <td className="py-3 pl-4 text-secondary">44"</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-bold">S (10)</td>
                    <td className="py-3 px-4 text-secondary">34"</td>
                    <td className="py-3 px-4 text-secondary">28"</td>
                    <td className="py-3 px-4 text-secondary">37"</td>
                    <td className="py-3 pl-4 text-secondary">44.5"</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-bold">M (12)</td>
                    <td className="py-3 px-4 text-secondary">36"</td>
                    <td className="py-3 px-4 text-secondary">30"</td>
                    <td className="py-3 px-4 text-secondary">39"</td>
                    <td className="py-3 pl-4 text-secondary">45"</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-bold">L (14)</td>
                    <td className="py-3 px-4 text-secondary">38"</td>
                    <td className="py-3 px-4 text-secondary">32"</td>
                    <td className="py-3 px-4 text-secondary">41"</td>
                    <td className="py-3 pl-4 text-secondary">45.5"</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <button 
              onClick={() => setIsSizeGuideOpen(false)}
              className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-3.5 mt-8 hover:bg-secondary transition-colors"
            >
              GOT IT
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 font-label-caps text-[10px] text-secondary uppercase tracking-widest">
          <li><button onClick={() => navigateTo('home')} className="hover:text-primary bg-transparent border-none p-0 cursor-pointer">Home</button></li>
          <li><span className="mx-1 text-secondary/40">/</span></li>
          <li><button onClick={() => navigateTo('shop')} className="hover:text-primary bg-transparent border-none p-0 cursor-pointer">Shop</button></li>
          <li><span className="mx-1 text-secondary/40">/</span></li>
          <li className="text-primary font-bold">{prod.title}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-[60px] items-start">

        {/* Media Gallery with dynamic snap-scroll and indicators */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div 
            ref={carouselRef}
            onScroll={handleScroll}
            className="w-full bg-surface-container-low aspect-[3/4] overflow-x-auto flex snap-x snap-mandatory scroll-smooth no-scrollbar cursor-ew-resize"
          >
            {colorImages.map((imgUrl, index) => (
              <div 
                key={index} 
                className="w-full h-full min-w-full flex-shrink-0 snap-center overflow-hidden"
              >
                <img
                  alt={`${prod.title} - View ${index + 1}`}
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  src={imgUrl}
                />
              </div>
            ))}
          </div>

          {/* Dynamic miniature bottom thumbnails */}
          <div className="flex justify-center gap-3 mt-2 overflow-x-auto no-scrollbar py-1">
            {colorImages.map((imgUrl, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`w-14 h-18 md:w-16 md:h-20 bg-surface-container-low overflow-hidden transition-all duration-300 border flex-shrink-0 p-0 ${activeImageIdx === index ? 'border-primary opacity-100 scale-105 shadow-sm' : 'border-outline-variant/30 opacity-60 hover:opacity-100'}`}
              >
                <img 
                  alt={`Thumbnail ${index + 1}`} 
                  src={imgUrl} 
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Info & Action */}
        <div className="lg:col-span-5 relative">
          <div className="flex flex-col pt-2 lg:pt-0">
            <div className="mb-6">
              {prod.badge && (
                <span className="bg-soft-beige px-3 py-1 font-label-caps text-[9px] text-primary uppercase tracking-widest mb-3 inline-block font-bold">{prod.badge}</span>
              )}
              {!currentInStock && (
                <span className="bg-white/90 border border-outline-variant/30 text-primary px-3 py-1 font-label-caps text-[9px] uppercase tracking-widest mb-3 inline-block font-bold ml-2">Out of Stock</span>
              )}
              {/* Clean elegant serif product title - sized smaller for premium style */}
              <h1 className={`font-display-lg text-[22px] md:text-[30px] text-primary mb-2.5 leading-snug tracking-tight font-bold uppercase ${!currentInStock ? 'opacity-60' : ''}`}>{prod.title}</h1>
              
              {/* Premium pricing display with market crossed-out original price */}
              <div className="flex items-baseline gap-3 mt-2">
                <span className="font-price-lg text-[22px] md:text-[24px] text-primary font-bold">₹{prod.price.toLocaleString()}</span>
                <span className="text-sm md:text-base text-secondary line-through opacity-60">₹{originalPrice.toLocaleString()}</span>
                <span className="text-[10px] md:text-xs text-muted-terracotta font-label-caps font-bold">({Math.round((1 - prod.price/originalPrice) * 100)}% OFF)</span>
              </div>
            </div>

            {prod.description && (
              <div className="mb-6 border-b border-outline-variant/20 pb-6">
                <div className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                  <ReactMarkdown>{prod.description}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Colors Selector */}
            {prod.colorsHex && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-label-caps text-[10px] text-primary uppercase tracking-widest font-bold">Colour</span>
                  <span className="font-body-md text-xs text-secondary font-bold">{selectedColor}</span>
                </div>
                <div className="flex gap-2.5 flex-wrap">
                  {Object.entries(prod.colorsHex).map(([col, hex]) => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      title={col}
                      className={`flex items-center gap-2 px-3 py-2 border transition-all duration-300 text-[10px] font-label-caps bg-transparent cursor-pointer ${selectedColor === col ? 'border-primary text-primary font-bold bg-primary/5' : 'border-outline-variant/30 text-secondary hover:border-primary'}`}
                    >
                      <span className="w-3 h-3 rounded-full border border-outline/20 flex-shrink-0" style={{ backgroundColor: hex }} />
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Premium, minimalist size grid */}
            {prod.sizes && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-label-caps text-[10px] text-primary uppercase tracking-widest font-bold">Size</span>
                  <button 
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="font-label-caps text-[9px] text-muted-terracotta underline underline-offset-4 decoration-muted-terracotta/40 cursor-pointer bg-transparent border-none hover:text-primary hover:decoration-primary transition-colors"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {prod.sizes.map(sz => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2.5 font-label-caps text-[11px] transition-all duration-200 border cursor-pointer ${selectedSize === sz ? 'border-primary bg-primary text-on-primary font-bold' : 'border-outline-variant/30 hover:border-primary text-primary bg-transparent'}`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Bag */}
            <button
              disabled={!currentInStock}
              onClick={() => addToCart(prod, selectedSize, selectedColor)}
              className={`w-full py-4 font-label-caps text-label-caps tracking-widest transition-all duration-300 mb-8 shadow-md border-none text-xs font-bold ${!currentInStock ? 'bg-surface-variant text-secondary cursor-not-allowed opacity-70' : 'bg-primary text-on-primary hover:bg-muted-terracotta cursor-pointer'}`}
            >
              {!currentInStock ? 'OUT OF STOCK' : 'ADD TO BAG'}
            </button>

            {/* Accordions */}
            <div className="border-t border-outline-variant/20 mb-8">
              {[
                { key: 'details', label: 'Details & Care', content: (
                  <div className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                    {prod.details_care ? <ReactMarkdown>{prod.details_care}</ReactMarkdown> : (
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li>100% Ahimsa Silk (Cruelty-Free, Handspun)</li>
                        <li>Hand-loomed by heritage master artisans in Jaipur, India</li>
                        <li>Printed using natural block prints and minerals</li>
                        <li>Dry clean only using mild organic detergents</li>
                      </ul>
                    )}
                  </div>
                )},
                { key: 'shipping', label: 'Shipping & Returns', content: (
                  <div className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                    {prod.shipping_info ? <ReactMarkdown>{prod.shipping_info}</ReactMarkdown> : (
                      <p>Complimentary express shipping on orders over ₹25,000. Delivery typically takes 3-5 business days. We accept returns within 14 days of delivery.</p>
                    )}
                  </div>
                )}
              ].map(({ key, label, content }) => (
                <div key={key} className="border-b border-outline-variant/20">
                  <button
                    onClick={() => setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }))}
                    className="w-full py-4 flex justify-between items-center text-left focus:outline-none bg-transparent border-none cursor-pointer"
                  >
                    <span className="font-label-caps text-[10px] text-primary uppercase tracking-widest font-bold">{label}</span>
                    <span className={`material-symbols-outlined transition-transform duration-300 text-[18px] ${openAccordions[key] ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  <div className={`transition-all duration-300 overflow-hidden ${openAccordions[key] ? 'max-h-[300px] pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Carousel (Related Products) */}
      <section className="mt-8 border-t border-outline-variant/20 pt-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="font-label-caps text-[9px] text-muted-terracotta tracking-[0.25em] uppercase mb-1.5 block">Complete the look</span>
            <h2 className="font-display-lg text-xl md:text-2xl font-bold tracking-tight text-primary uppercase">You May Also Love</h2>
          </div>
          <span className="text-[10px] text-secondary font-label-caps tracking-widest hidden md:inline-block uppercase opacity-75">Swipe to explore →</span>
        </div>

        {/* Dynamic scrollable strip without buttons */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-4">
          {recommendations.map(item => (
            <div
              key={item.id}
              onClick={() => {
                viewProductDetails(item.id);
              }}
              className="w-[180px] md:w-[260px] min-w-[180px] md:min-w-[260px] snap-start cursor-pointer group text-left"
            >
              <div className={`relative aspect-[3/4] overflow-hidden bg-surface-container-low mb-3 ${item.inStock === false ? 'opacity-55' : ''}`}>
                <img 
                  alt={item.title} 
                  src={item.imageMain} 
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" 
                />
                {item.badge && (
                  <span className="absolute top-2 left-2 bg-soft-beige px-2 py-0.5 font-label-caps text-[8px] text-primary uppercase tracking-widest font-bold">{item.badge}</span>
                )}
                {item.inStock === false && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <span className="bg-white/90 text-primary font-label-caps text-[9px] uppercase tracking-widest px-4 py-1.5 border border-outline-variant/30">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
              <h3 className="font-body-md text-[13px] md:text-sm text-primary mb-1 group-hover:text-muted-terracotta transition-colors truncate font-semibold leading-snug">{item.title}</h3>
              <div className="flex items-baseline gap-2">
                <span className="font-price-lg text-xs md:text-sm text-primary font-bold">₹{item.price.toLocaleString()}</span>
                <span className="text-[10px] md:text-xs text-secondary line-through opacity-50">
                  ₹{(item.originalPrice || Math.round(item.price * 1.35)).toLocaleString()}
                </span>
              </div>
              
              {/* Show available color swatches */}
              {item.colorsHex && (
                <div className="flex gap-1.5 mt-2">
                  {Object.entries(item.colorsHex).map(([colName, hex]) => (
                    <span 
                      key={colName} 
                      title={colName}
                      className="w-2.5 h-2.5 rounded-full border border-outline/20 flex-shrink-0 inline-block shadow-sm" 
                      style={{ backgroundColor: hex }} 
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
