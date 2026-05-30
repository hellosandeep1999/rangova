import React, { useState } from 'react';

export default function Shop({ PRODUCTS, navigateTo, addToCart, viewProductDetails }) {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('Featured');

  const filtered = PRODUCTS
    .filter(p =>
      (categoryFilter === 'All' || p.category === categoryFilter) &&
      p.title.toLowerCase().includes(searchFilter.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'Price: Low to High') return a.price - b.price;
      if (sortOrder === 'Price: High to Low') return b.price - a.price;
      return 0;
    });

  return (
    <div className="pt-8 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-left">
      <h1 className="font-headline-xl text-[32px] md:text-[48px] text-primary mb-8 text-center">All Collections</h1>

      {/* Category tabs */}
      <div className="flex overflow-x-auto no-scrollbar space-x-6 md:space-x-10 pb-5 justify-start md:justify-center border-b border-outline-variant/20 mb-10">
        {['All', 'Co-ords', 'Dresses', 'Shirts', 'Skirts', 'Tops'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`font-label-caps text-label-caps uppercase pb-2 transition-all duration-300 border-0 border-b-2 bg-transparent whitespace-nowrap flex-shrink-0 text-[11px] ${categoryFilter === cat ? 'text-primary border-primary font-bold' : 'text-secondary border-transparent hover:text-primary'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-56 flex-shrink-0">
          <div className="space-y-6 lg:sticky lg:top-28">
            <div>
              <h3 className="font-headline-sm text-base font-bold text-primary mb-3">Availability</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer text-sm">
                  <input type="checkbox" defaultChecked className="rounded-none" />
                  <span>In Stock (38)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-sm">
                  <input type="checkbox" className="rounded-none" />
                  <span>Out of Stock (3)</span>
                </label>
              </div>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-primary mb-3">Refine Search</h3>
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Type a product name…"
                className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-2 placeholder:text-secondary/50 font-body-md text-sm text-primary rounded-none"
              />
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
            <span className="font-label-caps text-label-caps text-secondary uppercase text-[11px]">
              Showing {filtered.length} Products
            </span>
            <div className="flex items-center space-x-2">
              <label className="font-label-caps text-[10px] text-secondary">Sort</label>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className="bg-transparent border-none font-body-md text-sm text-primary focus:ring-0 cursor-pointer py-1"
              >
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6">
            {filtered.map(prod => (
              <div
                key={prod.id}
                onClick={() => {
                  viewProductDetails(prod.id);
                }}
                className="group cursor-pointer text-left"
              >
                <div className="relative aspect-[3/4] overflow-hidden mb-3 bg-surface-container-low">
                  <img alt={prod.title} src={prod.imageMain} className="product-img product-img-main absolute inset-0 w-full h-full object-cover object-top z-10" />
                  <img alt={prod.title} src={prod.imageHover} className="product-img product-img-hover absolute inset-0 w-full h-full object-cover object-top z-0 opacity-0" />
                  {prod.badge && (
                    <div className="absolute top-2 left-2 z-20">
                      <span className="bg-soft-beige px-2 py-0.5 font-label-caps text-[9px] text-primary uppercase tracking-widest">{prod.badge}</span>
                    </div>
                  )}
                  {/* Always-visible add button */}
                  <button
                    onClick={e => { e.stopPropagation(); addToCart(prod, prod.sizes?.[0] || 'S', prod.colors?.[0] || ''); }}
                    className="absolute bottom-2 right-2 z-20 w-8 h-8 bg-primary text-white flex items-center justify-center hover:bg-muted-terracotta transition-colors duration-200 shadow border-none"
                    title="Quick Add"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
                <h3 className="font-body-md text-[13px] md:text-[14px] text-primary mb-1 group-hover:text-muted-terracotta transition-colors leading-snug">{prod.title}</h3>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-price-lg text-[14px] text-primary">₹{prod.price.toLocaleString()}</span>
                  {prod.originalPrice && <span className="text-[11px] text-secondary line-through">₹{prod.originalPrice.toLocaleString()}</span>}
                </div>
                {prod.colorsHex && (
                  <div className="flex gap-1.5 items-center flex-wrap">
                    {Object.entries(prod.colorsHex).map(([name, hex]) => (
                      <span key={name} title={name} className="w-3 h-3 rounded-full border border-outline/30 inline-block" style={{ backgroundColor: hex }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
