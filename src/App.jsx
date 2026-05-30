import React, { useState, useEffect } from 'react';
import { PRODUCTS } from './data/products';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ProductDetails from './components/ProductDetails';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Search from './pages/Search';
import OurStory from './pages/OurStory';
import Login from './pages/Login';
import Checkout from './pages/Checkout';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [cart, setCart] = useState([
    {
      id: 'jaipur-tunic',
      title: 'Jaipur Block Print Tunic',
      price: 15170,
      quantity: 1,
      size: 'M',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIMCleAHy_Z09EtEd1LYIX1Jj3daP_uqwC2XO5XCRXnyiDcX35qnAkLGPSzKzRgWJZX-wgK_AAe2zEAwYgMXsGL7r1Z5yhBUl-mHaiMFpGv7_Xaq2nzB3OkjK6_NSOWwWH5jpyxH3Iy99c1vWTxbrvFw8KgkgQK95gT8WsTLqdar6HA7v2xg6waS2GGGqTdi6vuKBR_5KCzEpaTp7LuZL83frPFAZFgMi5o39nl005PCcfJgJC6e24lENeLmfXfxVmMArgE_Kb7A'
    },
    {
      id: 'silk-scarf',
      title: 'Artisan Silk Scarf',
      price: 7790,
      quantity: 2,
      color: 'Terracotta',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMAZvhUkxL9nWVbg7dmMSF7GWEQdHQCNwJGZmmA1GLqpcA4tmu0BUJ17rURUoFa7fsklA35xxu1jjT6_y3t6PuXdO5sWGJCZI2Z73Ijz2G8SIpWoX3i5jNxHOfe8gheFd4FbDrlOSIwcoGEtiU2spwwi65hH0p_Wask0p0-oTIsAnOC6lWC2i0EH9QV7GX-0H3Thzusq1dh5wSfQYOPyBWCvru6SdF4K6NXTU84mO6cLYANIjxAdvQXFlaWNRWkWL4c728TM5jdA'
    }
  ]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const [isHeaderShrunk, setIsHeaderShrunk] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => setIsHeaderShrunk(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  }, [currentPage]);

  const triggerNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  const addToCart = (product, size = 'S', color = '') => {
    const existingIndex = cart.findIndex(
      item => item.id === product.id && item.size === size && item.color === color
    );
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, {
        id: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
        size,
        color,
        image: product.imageMain
      }]);
    }
    triggerNotification(`Added ${product.title} to your bag.`);
    setIsCartOpen(true);
  };

  const [selectedProductId, setSelectedProductId] = useState('jaipur-trench');

  const updateQuantity = (index, amount) => {
    const updated = [...cart];
    updated[index].quantity += amount;
    if (updated[index].quantity <= 0) updated.splice(index, 1);
    setCart(updated);
  };

  const viewProductDetails = (id) => {
    setSelectedProductId(id);
    navigateTo('product-details');
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const sharedProps = { navigateTo, triggerNotification, addToCart, PRODUCTS, viewProductDetails };

  return (
    <div className="bg-warm-ivory text-on-surface antialiased min-h-screen flex flex-col font-body-md relative selection:bg-muted-terracotta selection:text-white">

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 md:right-6 bg-primary text-on-primary px-5 py-3 uppercase font-label-caps text-[10px] tracking-widest shadow-xl z-[60] transition-all duration-300 flex items-center gap-3 max-w-[280px] md:max-w-sm">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          {notification}
        </div>
      )}

      {/* Global Header */}
      {currentPage !== 'checkout' && (
        <Header
          currentPage={currentPage}
          navigateTo={navigateTo}
          isHeaderShrunk={isHeaderShrunk}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          totalItemsCount={totalItemsCount}
          setIsCartOpen={setIsCartOpen}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cart={cart}
        updateQuantity={updateQuantity}
        totalItemsCount={totalItemsCount}
        subtotal={subtotal}
        navigateTo={navigateTo}
      />

      {/* Main Content */}
      <main className="flex-grow">
        {currentPage === 'home' && (
          <Home {...sharedProps} setCategoryFilter={setCategoryFilter} />
        )}
        {currentPage === 'shop' && (
          <Shop {...sharedProps} />
        )}
        {currentPage === 'search' && (
          <Search {...sharedProps} />
        )}
        {currentPage === 'product-details' && (
          <ProductDetails navigateTo={navigateTo} addToCart={addToCart} selectedProductId={selectedProductId} viewProductDetails={viewProductDetails} />
        )}
        {currentPage === 'our-story' && (
          <OurStory navigateTo={navigateTo} />
        )}
        {currentPage === 'login' && (
          <Login navigateTo={navigateTo} triggerNotification={triggerNotification} setCurrentUser={setCurrentUser} />
        )}
        {currentPage === 'checkout' && (
          <Checkout
            cart={cart}
            subtotal={subtotal}
            navigateTo={navigateTo}
            setIsCartOpen={setIsCartOpen}
            setCart={setCart}
            triggerNotification={triggerNotification}
          />
        )}
      </main>

      {/* Footer */}
      {currentPage !== 'checkout' && (
        <Footer navigateTo={navigateTo} triggerNotification={triggerNotification} />
      )}
    </div>
  );
}

export default App;
