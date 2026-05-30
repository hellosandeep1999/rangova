import React, { useState } from 'react';

export default function Search({ navigateTo, addToCart, PRODUCTS, viewProductDetails }) {
  const [query, setQuery] = useState('');

  const TRENDING = ['Co-ords', 'Silk Kurta', 'Indigo Print', 'Block Print', 'Terracotta', 'Jaipur Trench'];
  const SUGGESTIONS = PRODUCTS.map(p => p.title);

  const filtered = query.trim().length > 0
    ? PRODUCTS.filter(p =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      (p.colors || []).some(c => c.toLowerCase().includes(query.toLowerCase()))
    )
    : [];

  const activeSuggestions = query.trim().length > 0
    ? SUGGESTIONS.filter(s => s.toLowerCase().includes(query.toLowerCase()) && s.toLowerCase() !== query.toLowerCase())
    : [];

  return (
    <div className="min-h-screen bg-warm-ivory pt-8 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">

      {/* Search Header */}
      <div className="text-center mb-8">
        <span className="font-label-caps text-[10px] text-muted-terracotta tracking-[0.25em] uppercase mb-2 block">Find Your Perfect Piece</span>
        <h1 className="font-headline-xl text-[28px] md:text-[44px] text-primary mb-6">Search Collection</h1>

        {/* Search Input */}
        <div className="relative max-w-xl mx-auto">
          <div className="flex items-center border-b-2 border-primary bg-transparent gap-3 pb-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">search</span>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for kurtas, co-ords, silk…"
              className="flex-1 bg-transparent border-none focus:ring-0 font-body-md text-[16px] text-primary placeholder:text-secondary/50 outline-none py-1"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-secondary hover:text-primary transition-colors bg-transparent border-none"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Live Suggestions Dropdown */}
          {activeSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-outline-variant/30 shadow-lg z-20 mt-1 text-left">
              {activeSuggestions.slice(0, 5).map((s, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(s)}
                  className="w-full text-left px-4 py-3 font-body-md text-sm text-primary hover:bg-surface-container-low transition-colors border-none bg-transparent flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-secondary text-[16px]">north_west</span>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trending Searches */}
      {query.trim().length === 0 && (
        <div className="mb-10">
          <span className="font-label-caps text-[10px] text-secondary uppercase tracking-widest mb-4 block">Trending Searches</span>
          <div className="flex flex-wrap gap-2">
            {TRENDING.map((t, i) => (
              <button
                key={i}
                onClick={() => setQuery(t)}
                className="font-label-caps text-[11px] text-primary uppercase tracking-wider border border-outline-variant px-4 py-2 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 bg-transparent"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Query: Featured Products */}
      {query.trim().length === 0 && (
        <div>
          <span className="font-label-caps text-[10px] text-secondary uppercase tracking-widest mb-5 block">Featured Products</span>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {PRODUCTS.slice(0, 4).map(prod => (
              <div
                key={prod.id}
                onClick={() => viewProductDetails(prod.id)}
                className="group cursor-pointer text-left"
              >
                <div className="relative aspect-[3/4] overflow-hidden mb-2 bg-surface-container-low">
                  <img alt={prod.title} src={prod.imageMain} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  <button
                    onClick={e => { e.stopPropagation(); addToCart(prod, prod.sizes?.[0] || 'S', prod.colors?.[0] || ''); }}
                    className="absolute bottom-2 right-2 w-8 h-8 bg-primary text-white flex items-center justify-center hover:bg-muted-terracotta transition-colors border-none shadow"
                    title="Quick Add"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
                <h3 className="font-body-md text-[13px] text-primary leading-tight mb-1">{prod.title}</h3>
                <span className="font-price-lg text-[13px] text-primary">₹{prod.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {query.trim().length > 0 && (
        <div>
          <span className="font-label-caps text-[10px] text-secondary uppercase tracking-widest mb-5 block">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{query}"
          </span>
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-outline-variant text-5xl mb-4 block">search_off</span>
              <p className="font-body-md text-secondary mb-2">No products matched your search.</p>
              <p className="text-sm text-secondary/70">Try searching for "silk", "indigo" or "co-ords".</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(prod => (
                <div
                  key={prod.id}
                  onClick={() => viewProductDetails(prod.id)}
                  className="group cursor-pointer text-left"
                >
                  <div className="relative aspect-[3/4] overflow-hidden mb-2 bg-surface-container-low">
                    <img alt={prod.title} src={prod.imageMain} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                    <button
                      onClick={e => { e.stopPropagation(); addToCart(prod, prod.sizes?.[0] || 'S', prod.colors?.[0] || ''); }}
                      className="absolute bottom-2 right-2 w-8 h-8 bg-primary text-white flex items-center justify-center hover:bg-muted-terracotta transition-colors border-none shadow"
                      title="Quick Add"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                  <h3 className="font-body-md text-[13px] text-primary leading-tight mb-1">{prod.title}</h3>
                  <span className="font-price-lg text-[13px] text-primary">₹{prod.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      {query.trim().length > 0 && (
        <div>
          <span className="font-label-caps text-[10px] text-secondary uppercase tracking-widest mb-5 block">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{query}"
          </span>
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-outline-variant text-5xl mb-4 block">search_off</span>
              <p className="font-body-md text-secondary mb-2">No products matched your search.</p>
              <p className="text-sm text-secondary/70">Try searching for "silk", "indigo" or "co-ords".</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(prod => (
                <div
                  key={prod.id}
                  onClick={() => navigateTo('product-details')}
                  className="group cursor-pointer text-left"
                >
                  <div className="relative aspect-[3/4] overflow-hidden mb-2 bg-surface-container-low">
                    <img alt={prod.title} src={prod.imageMain} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                    {prod.badge && (
                      <span className="absolute top-2 left-2 bg-soft-beige px-2 py-0.5 font-label-caps text-[9px] text-primary uppercase tracking-widest z-10">{prod.badge}</span>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); addToCart(prod, prod.sizes?.[0] || 'S', prod.colors?.[0] || ''); }}
                      className="absolute bottom-2 right-2 w-8 h-8 bg-primary text-white flex items-center justify-center hover:bg-muted-terracotta transition-colors border-none shadow"
                      title="Quick Add"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                  <h3 className="font-body-md text-[13px] text-primary leading-tight mb-1 group-hover:text-muted-terracotta transition-colors">{prod.title}</h3>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-price-lg text-[13px] text-primary">₹{prod.price.toLocaleString()}</span>
                    {prod.originalPrice && <span className="text-[11px] text-secondary line-through">₹{prod.originalPrice.toLocaleString()}</span>}
                  </div>
                  <span className="font-label-caps text-[9px] text-secondary uppercase tracking-widest">{prod.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
