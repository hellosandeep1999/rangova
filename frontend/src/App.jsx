import React, { useState, useEffect } from 'react';
import { getProducts, getCategories } from './lib/api';
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
import Contact from './pages/Contact';
import Policies from './pages/Policies';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function App() {
  const [currentPage, setCurrentPage] = useState(window.location.pathname.replace('/', '') || 'home');
  const [cart, setCart] = useState([]);
  const [PRODUCTS, setPRODUCTS] = useState([]);
  const [CATEGORIES, setCATEGORIES] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodsData, catsData] = await Promise.all([
          getProducts().catch(() => null),
          getCategories().catch(() => null)
        ]);

        if (prodsData) {
          const mappedProducts = prodsData.map(p => ({
            ...p,
            imageMain: p.image_main || p.imageMain,
            imageHover: p.image_hover || p.imageHover,
            originalPrice: p.original_price || p.originalPrice,
            inStock: p.in_stock !== undefined ? p.in_stock : p.inStock,
            colorsHex: p.colors_hex || p.colorsHex,
            imagesByColor: p.images_by_color || p.imagesByColor
          }));
          setPRODUCTS(mappedProducts);
        }

        if (catsData) {
          // DB uses 'title' column; map it to 'name' for all consumer components
          const mappedCats = catsData.map(c => ({ ...c, name: c.title || c.name }));
          setCATEGORIES(mappedCats);
        }
      } catch (e) {
        console.error('Error fetching data', e);
      }
    };
    fetchData();
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const [isHeaderShrunk, setIsHeaderShrunk] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [currentUser, setCurrentUser] = useState(null);
  const [discount, setDiscount] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const { supabase } = await import('./lib/api');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: customerData } = await supabase.from('customers').select('*').eq('email', session.user.email).single();
        setCurrentUser({
          ...session.user,
          name: session.user.user_metadata?.first_name ? `${session.user.user_metadata.first_name} ${session.user.user_metadata.last_name}` : session.user.email.split('@')[0],
          phone: session.user.user_metadata?.phone || '',
          addresses: customerData?.addresses || []
        });
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: customerData } = await supabase.from('customers').select('*').eq('email', session.user.email).single();
          setCurrentUser({
            ...session.user,
            name: session.user.user_metadata?.first_name ? `${session.user.user_metadata.first_name} ${session.user.user_metadata.last_name}` : session.user.email.split('@')[0],
            phone: session.user.user_metadata?.phone || '',
            addresses: customerData?.addresses || []
          });
        } else {
          setCurrentUser(null);
        }
      });
    };
    initAuth();
  }, []);

  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const { getActiveDiscount } = await import('./lib/api');
        const active = await getActiveDiscount();
        if (active && active.length > 0) {
          setDiscount(active);
        } else {
          setDiscount(null);
        }
      } catch (err) {
        setDiscount(null);
      }
    };
    fetchDiscount();
  }, []);

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
    window.history.pushState({}, '', '/' + (page === 'home' ? '' : page));
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

  const sharedProps = { navigateTo, triggerNotification, addToCart, PRODUCTS, CATEGORIES, viewProductDetails };

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
      {currentPage !== 'checkout' && currentPage !== 'admin' && (
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
          discount={discount}
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
        discount={discount}
      />

      {/* Main Content */}
      <main className="flex-grow">
        {currentPage === 'home' && (
          <Home {...sharedProps} setCategoryFilter={setCategoryFilter} />
        )}
        {currentPage === 'shop' && (
          <Shop {...sharedProps} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} />
        )}
        {currentPage === 'search' && (
          <Search {...sharedProps} />
        )}
        {currentPage === 'product-details' && (
          <ProductDetails navigateTo={navigateTo} addToCart={addToCart} selectedProductId={selectedProductId} viewProductDetails={viewProductDetails} products={PRODUCTS} />
        )}
        {currentPage === 'our-story' && (
          <OurStory navigateTo={navigateTo} />
        )}
        {currentPage === 'login' && (
          <Login navigateTo={navigateTo} triggerNotification={triggerNotification} setCurrentUser={setCurrentUser} />
        )}
        {currentPage === 'contact' && (
          <Contact navigateTo={navigateTo} triggerNotification={triggerNotification} currentUser={currentUser} />
        )}
        {currentPage === 'policies' && (
          <Policies navigateTo={navigateTo} />
        )}
        {currentPage === 'checkout' && (
          <Checkout
            cart={cart}
            subtotal={subtotal}
            navigateTo={navigateTo}
            setIsCartOpen={setIsCartOpen}
            setCart={setCart}
            triggerNotification={triggerNotification}
            currentUser={currentUser}
            discount={discount}
          />
        )}
        {currentPage === 'profile' && (
          <Profile navigateTo={navigateTo} currentUser={currentUser} setCurrentUser={setCurrentUser} triggerNotification={triggerNotification} />
        )}
        {currentPage === 'admin' && (
          <Admin navigateTo={navigateTo} triggerNotification={triggerNotification} />
        )}
      </main>

      {/* Footer */}
      {currentPage !== 'checkout' && currentPage !== 'admin' && (
        <Footer navigateTo={navigateTo} triggerNotification={triggerNotification} />
      )}
    </div>
  );
}

export default App;
