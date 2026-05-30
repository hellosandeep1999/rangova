import React, { useState } from 'react';

export default function Header({ 
  currentPage, 
  navigateTo, 
  isHeaderShrunk, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  totalItemsCount, 
  setIsCartOpen,
  currentUser,
  setCurrentUser
}) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleProfileClick = () => {
    if (!currentUser) {
      navigateTo('login');
      setIsProfileDropdownOpen(false);
    } else {
      setIsProfileDropdownOpen(!isProfileDropdownOpen);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsProfileDropdownOpen(false);
    navigateTo('home');
  };

  return (
    <header className={`sticky top-0 z-50 bg-surface transition-all duration-300 w-full border-b border-surface-variant/30 ${isHeaderShrunk ? 'py-3 shadow-md' : 'py-5 shadow-sm'}`}>
      <nav className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative">
        
        {/* Left Nav (Desktop) */}
        <ul className="hidden md:flex space-x-8 items-center flex-1 justify-start">
          <li>
            <button 
              onClick={() => navigateTo('home')} 
              className={`font-label-caps text-label-caps hover:opacity-75 uppercase transition-all duration-200 relative group ${currentPage === 'home' ? 'text-primary font-bold' : 'text-secondary'}`}
            >
              Home
              <span className={`absolute -bottom-1 left-0 h-px bg-primary transition-all duration-300 ${currentPage === 'home' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateTo('shop')} 
              className={`font-label-caps text-label-caps hover:opacity-75 uppercase transition-all duration-200 relative group ${currentPage === 'shop' ? 'text-primary font-bold' : 'text-secondary'}`}
            >
              Shop
              <span className={`absolute -bottom-1 left-0 h-px bg-primary transition-all duration-300 ${currentPage === 'shop' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </button>
          </li>
        </ul>

        {/* Brand Logo */}
        <button 
          onClick={() => navigateTo('home')} 
          className="font-display-lg text-[22px] md:text-[32px] font-bold tracking-widest text-primary hover:opacity-80 transition-opacity duration-300 absolute left-1/2 -translate-x-1/2 uppercase"
        >
          RANGOVA
        </button>

        {/* Mobile Menu Trigger */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="md:hidden hover:opacity-70 transition-opacity duration-300 flex items-center p-1"
          aria-label="Menu"
        >
          <span className="material-symbols-outlined text-[26px]">
            {isMobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>

        {/* Trailing Icons */}
        <div className="flex items-center space-x-4 md:space-x-6 text-primary flex-1 justify-end relative">
          <button 
            onClick={() => navigateTo('search')} 
            className={`hover:opacity-70 transition-all duration-200 flex items-center ${currentPage === 'search' ? 'text-muted-terracotta' : ''}`}
            aria-label="Search"
          >
            <span className="material-symbols-outlined text-[22px] md:text-[24px]">search</span>
          </button>
          <button 
            onClick={() => setIsCartOpen(true)} 
            className="hover:opacity-70 transition-all duration-200 relative flex items-center"
            aria-label="Cart"
          >
            <span className="material-symbols-outlined text-[22px] md:text-[24px]">shopping_bag</span>
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-muted-terracotta text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </button>
          <button 
            onClick={handleProfileClick} 
            className={`hover:opacity-70 transition-all duration-200 relative flex items-center ${currentPage === 'login' || isProfileDropdownOpen ? 'text-muted-terracotta font-bold' : ''}`}
            aria-label="Profile"
          >
            <span className="material-symbols-outlined text-[22px] md:text-[24px]">person</span>
            {currentUser && (
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
            )}
          </button>

          {/* Premium Account Dropdown */}
          {isProfileDropdownOpen && currentUser && (
            <div className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-16 md:top-10 w-[calc(100vw-32px)] md:w-96 bg-white border border-outline-variant/30 shadow-2xl p-6 z-50 text-left animate-fadeIn font-body-md text-primary rounded-lg md:rounded-none">
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-4">
                <div>
                  <h4 className="font-headline-sm text-sm font-bold">{currentUser.name}</h4>
                  <p className="text-xs text-secondary">{currentUser.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="font-label-caps text-[9px] bg-primary text-white px-2.5 py-1 hover:bg-muted-terracotta transition-colors uppercase tracking-wider"
                >
                  Log Out
                </button>
              </div>

              {/* Saved Addresses */}
              <div className="mb-4">
                <span className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Saved Addresses</span>
                <div className="space-y-2 max-h-[80px] overflow-y-auto pr-1">
                  {currentUser.addresses.map((addr, idx) => (
                    <div key={idx} className="text-xs text-secondary bg-warm-ivory p-2 border border-outline-variant/10 rounded-sm leading-relaxed">
                      {addr}
                    </div>
                  ))}
                </div>
              </div>

              {/* Previous Orders */}
              <div>
                <span className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Order History</span>
                <div className="space-y-3 max-h-[140px] overflow-y-auto pr-1">
                  {currentUser.orders.map((order) => (
                    <div key={order.id} className="text-xs border-b border-outline-variant/10 pb-2 last:border-b-0">
                      <div className="flex justify-between font-bold mb-1">
                        <span>{order.id}</span>
                        <span className="text-muted-terracotta font-semibold">₹{order.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-secondary text-[11px]">
                        <span>{order.items}</span>
                        <span className="bg-soft-beige px-1.5 py-0.5 rounded-full text-[9px] text-primary">{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </nav>

      {/* Mobile Drawer Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 bottom-0 top-[60px] z-40 bg-surface flex flex-col justify-between p-8 border-t border-surface-variant/30 overflow-y-auto">
          <ul className="space-y-4 text-left mt-2">
            <li>
              <button 
                onClick={() => {
                  navigateTo('home');
                  setIsMobileMenuOpen(false);
                }} 
                className={`font-display-lg text-xl tracking-normal uppercase flex items-center justify-between w-full py-1.5 border-b border-surface-variant/20 ${currentPage === 'home' ? 'text-muted-terracotta font-bold' : 'text-secondary'}`}
              >
                <span>Home</span>
                <span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  navigateTo('shop');
                  setIsMobileMenuOpen(false);
                }} 
                className={`font-display-lg text-xl tracking-normal uppercase flex items-center justify-between w-full py-1.5 border-b border-surface-variant/20 ${currentPage === 'shop' ? 'text-muted-terracotta font-bold' : 'text-secondary'}`}
              >
                <span>Shop Collection</span>
                <span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  navigateTo('search');
                  setIsMobileMenuOpen(false);
                }} 
                className={`font-display-lg text-xl tracking-normal uppercase flex items-center justify-between w-full py-1.5 border-b border-surface-variant/20 ${currentPage === 'search' ? 'text-muted-terracotta font-bold' : 'text-secondary'}`}
              >
                <span>Search Products</span>
                <span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
              </button>
            </li>
            
            {/* Mobile Profile View */}
            <li>
              {!currentUser ? (
                <button 
                  onClick={() => {
                    navigateTo('login');
                    setIsMobileMenuOpen(false);
                  }} 
                  className={`font-display-lg text-xl tracking-normal uppercase flex items-center justify-between w-full py-1.5 border-b border-surface-variant/20 ${currentPage === 'login' ? 'text-muted-terracotta font-bold' : 'text-secondary'}`}
                >
                  <span>Sign In / Create Account</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
                </button>
              ) : (
                <div className="bg-warm-ivory p-4 border border-outline-variant/30 text-left mt-3">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h4 className="font-headline-sm text-sm font-bold">{currentUser.name}</h4>
                      <p className="text-xs text-secondary">{currentUser.email}</p>
                    </div>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="font-label-caps text-[9px] bg-primary text-white px-2 py-1 uppercase"
                    >
                      Log Out
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <span className="font-label-caps text-[9px] text-secondary tracking-widest block mb-1">Addresses</span>
                    {currentUser.addresses.map((addr, idx) => (
                      <p key={idx} className="text-[11px] text-secondary leading-snug mb-1">{addr}</p>
                    ))}
                  </div>

                  <div>
                    <span className="font-label-caps text-[9px] text-secondary tracking-widest block mb-1">Recent Orders</span>
                    {currentUser.orders.map((o) => (
                      <div key={o.id} className="text-[11px] flex justify-between border-t border-outline-variant/10 pt-1.5 mt-1.5">
                        <span>{o.id} • {o.items}</span>
                        <span className="font-bold">{o.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>
          </ul>

          <div className="pb-4 border-t border-surface-variant/30 pt-4 mt-4">
            <span className="font-label-caps text-[10px] text-muted-terracotta block mb-1 uppercase tracking-widest">Ancestral Craft, Modern Minimalism.</span>
            <span className="text-[9px] text-secondary tracking-wider block">© 2026 RANGOVA. ALL RIGHTS RESERVED.</span>
          </div>
        </div>
      )}
    </header>
  );
}
