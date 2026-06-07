import React, { useState, useEffect } from 'react';
import { getProducts, getOrders, getCustomers, getCategories, isAdminLoggedIn, adminLogin, adminLogout } from '../lib/api';

import AdminSidebar from '../components/admin/AdminSidebar';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminProducts from '../components/admin/AdminProducts';
import AdminOrders from '../components/admin/AdminOrders';
import AdminCustomers from '../components/admin/AdminCustomers';
import AdminCategories from '../components/admin/AdminCategories';
import AdminInventory from '../components/admin/AdminInventory';
import AdminDiscounts from '../components/admin/AdminDiscounts';
import AdminTransactions from '../components/admin/AdminTransactions';
import AdminSettings from '../components/admin/AdminSettings';
import AdminActivity from '../components/admin/AdminActivity';

export default function Admin({ navigateTo, triggerNotification }) {
  const [isAuthenticated, setIsAuthenticated] = useState(isAdminLoggedIn());
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const [chartFilter, setChartFilter] = useState('30days');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await adminLogin(loginUsername, loginPassword);
      setIsAuthenticated(true);
      setLoginError('');
      triggerNotification('Logged in successfully');
    } catch (err) {
      setLoginError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    adminLogout();
    setIsAuthenticated(false);
    triggerNotification('Logged out');
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [prods, ords, custs, cats] = await Promise.all([
        getProducts(), getOrders(), getCustomers(), getCategories()
      ]);
      setProducts(Array.isArray(prods) ? prods : []);
      setOrders(Array.isArray(ords) ? ords : []);
      setCustomers(Array.isArray(custs) ? custs : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error(err);
      triggerNotification(`Error loading dashboard: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try { setLoading(true); const data = await getProducts(); setProducts(Array.isArray(data) ? data : []); const cats = await getCategories(); setCategories(Array.isArray(cats) ? cats : []); }
    catch (err) { triggerNotification(`Error loading products: ${err.message || err}`); }
    finally { setLoading(false); }
  };

  const fetchOrders = async () => {
    try { setLoading(true); const data = await getOrders(); setOrders(Array.isArray(data) ? data : []); }
    catch (err) { triggerNotification(`Error loading orders: ${err.message || err}`); }
    finally { setLoading(false); }
  };

  const fetchCustomers = async () => {
    try { setLoading(true); const data = await getCustomers(); setCustomers(Array.isArray(data) ? data : []); }
    catch (err) { triggerNotification(`Error loading customers: ${err.message || err}`); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try { setLoading(true); const data = await getCategories(); setCategories(Array.isArray(data) ? data : []); }
    catch (err) { triggerNotification(`Error loading categories: ${err.message || err}`); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Fetch data based on the active tab
    if (activeTab === 'dashboard') fetchDashboardData();
    else if (activeTab === 'products') fetchProducts();
    else if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'customers') fetchCustomers();
    else if (activeTab === 'categories') fetchCategories();
    else if (activeTab === 'inventory') fetchProducts();
    else if (activeTab === 'transactions') fetchOrders();
  }, [activeTab, isAuthenticated]);

  // Basic stats & filtered stats
  const now = new Date();
  const filterDate = new Date();
  if (chartFilter === 'today') {
    filterDate.setHours(0, 0, 0, 0);
  } else if (chartFilter === '7days') {
    filterDate.setDate(now.getDate() - 7);
  } else {
    filterDate.setDate(now.getDate() - 30);
  }

  const filteredOrders = orders.filter(o => new Date(o.created_at) >= filterDate);
  const totalRevenue = filteredOrders.reduce((sum, ord) => sum + (parseFloat(ord.total) || 0), 0);
  const aov = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
  const lowStockCount = products.filter(p => !p.inStock).length;
  
  const pendingOrders = filteredOrders.filter(o => o.status === 'Pending').length;
  const shippedOrders = filteredOrders.filter(o => o.status === 'Shipped').length;
  const cancelledOrders = filteredOrders.filter(o => o.status === 'Cancelled').length;

  // Fake conversion rate for display
  const conversionRate = filteredOrders.length > 0 ? (Math.random() * 2 + 1).toFixed(2) : 0;

  const stats = {
    revenue: `₹${totalRevenue.toLocaleString()}`,
    orders: filteredOrders.length,
    products: products.length,
    customers: customers.length,
    aov: `₹${aov.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    lowStock: lowStockCount,
    conversion: `${conversionRate}%`,
    pendingOrders,
    shippedOrders,
    cancelledOrders
  };

  // Chart data generation
  const chartData = [];
  if (chartFilter === 'today') {
    // Group by hour
    for (let i = 0; i < 24; i++) {
      chartData.push({ name: `${i}:00`, revenue: 0, orders: 0 });
    }
    filteredOrders.forEach(o => {
      const h = new Date(o.created_at).getHours();
      chartData[h].revenue += parseFloat(o.total) || 0;
      chartData[h].orders += 1;
    });
  } else {
    // Group by day
    const days = chartFilter === '7days' ? 7 : 30;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      chartData.push({ 
        name: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), 
        revenue: 0, 
        orders: 0,
        fullDate: d.toDateString()
      });
    }
    filteredOrders.forEach(o => {
      const od = new Date(o.created_at).toDateString();
      const idx = chartData.findIndex(cd => cd.fullDate === od);
      if (idx !== -1) {
        chartData[idx].revenue += parseFloat(o.total) || 0;
        chartData[idx].orders += 1;
      }
    });
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-container text-primary font-body-md">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-sm border border-outline-variant/30 w-full max-w-sm flex flex-col gap-4 text-center">
          <h1 className="font-display-lg text-2xl tracking-widest uppercase mb-4 text-primary">Admin Login</h1>
          {loginError && <p className="text-red-600 text-sm font-bold">{loginError}</p>}
          <input
            type="text"
            placeholder="Username"
            required
            className="w-full border border-outline-variant/30 p-3 text-sm bg-transparent outline-none focus:border-primary"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full border border-outline-variant/30 p-3 text-sm bg-transparent outline-none focus:border-primary"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <button type="submit" className="w-full py-3 bg-primary text-white font-label-caps text-[10px] tracking-widest uppercase hover:bg-secondary transition-colors cursor-pointer border-none mt-4">
            Login
          </button>
          <button type="button" onClick={() => navigateTo('home')} className="w-full py-3 bg-transparent text-secondary font-label-caps text-[10px] tracking-widest uppercase hover:text-primary transition-colors cursor-pointer border border-outline-variant/30">
            Back to Store
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface-container text-left text-primary font-body-md overflow-hidden relative">
      <AdminSidebar 
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navigateTo={navigateTo}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-surface-container-low p-4 md:p-8 flex flex-col">
        {/* Mobile Header Toggle */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <h1 className="font-display-lg text-xl tracking-widest uppercase text-primary">Admin</h1>
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="text-primary bg-transparent border-none cursor-pointer">
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <AdminDashboard 
            stats={stats} 
            chartFilter={chartFilter} 
            setChartFilter={setChartFilter} 
            chartData={chartData} 
          />
        )}

        {activeTab === 'products' && (
          <AdminProducts 
            products={products}
            setProducts={setProducts}
            categories={categories}
            triggerNotification={triggerNotification}
            onRefresh={fetchProducts}
            loading={loading}
          />
        )}

        {activeTab === 'orders' && (
          <AdminOrders 
            orders={orders}
            setOrders={setOrders}
            triggerNotification={triggerNotification}
            onRefresh={fetchOrders}
            loading={loading}
          />
        )}

        {activeTab === 'customers' && (
          <AdminCustomers 
            customers={customers}
            triggerNotification={triggerNotification}
            onRefresh={fetchCustomers}
            loading={loading}
          />
        )}

        {activeTab === 'categories' && (
          <AdminCategories 
            categories={categories}
            setCategories={setCategories}
            triggerNotification={triggerNotification}
            onRefresh={fetchCategories}
            loading={loading}
          />
        )}

        {activeTab === 'inventory' && (
          <AdminInventory 
            products={products}
            triggerNotification={triggerNotification}
            onRefresh={fetchProducts}
            loading={loading}
          />
        )}

        {activeTab === 'discounts' && (
          <AdminDiscounts 
            triggerNotification={triggerNotification}
            loading={loading}
          />
        )}

        {activeTab === 'transactions' && (
          <AdminTransactions 
            orders={orders}
            triggerNotification={triggerNotification}
            loading={loading}
          />
        )}

        {activeTab === 'settings' && (
          <AdminSettings 
            triggerNotification={triggerNotification}
          />
        )}

        {activeTab === 'activity' && (
          <AdminActivity 
            triggerNotification={triggerNotification}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

