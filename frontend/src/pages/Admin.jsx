import React, { useState, useEffect } from 'react';
import { getProducts, deleteProduct, getOrders, updateOrderStatus, getCustomers, createProduct, updateProduct, getCategories, createCategory, updateCategory, deleteCategory, isAdminLoggedIn, adminLogin, adminLogout } from '../lib/api';

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

  // Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '', category: '', price: '', originalPrice: '', imageMain: '', imageHover: '', inStock: true
  });

  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm(product);
    } else {
      setEditingProduct(null);
      setProductForm({ title: '', category: '', price: '', originalPrice: '', imageMain: '', imageHover: '', inStock: true });
    }
    setShowProductModal(true);
  };

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', image_url: '' });

  const handleOpenCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm(category);
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', slug: '', description: '', image_url: '' });
    }
    setShowCategoryModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, productForm);
        setProducts(products.map(p => p.id === editingProduct.id ? updated : p));
        triggerNotification('Product updated successfully');
      } else {
        const created = await createProduct(productForm);
        setProducts([created, ...products]);
        triggerNotification('Product added successfully');
      }
      setShowProductModal(false);
    } catch (err) {
      console.error(err);
      triggerNotification('Error saving product');
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, categoryForm);
        setCategories(categories.map(c => c.id === editingCategory.id ? updated : c));
        triggerNotification('Category updated successfully');
      } else {
        const created = await createCategory(categoryForm);
        setCategories([created, ...categories]);
        triggerNotification('Category added successfully');
      }
      setShowCategoryModal(false);
    } catch (err) {
      console.error(err);
      triggerNotification('Error saving category');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const [prods, ords, custs, cats] = await Promise.all([
          getProducts(),
          getOrders(),
          getCustomers(),
          getCategories()
        ]);
        setProducts(Array.isArray(prods) ? prods : []);
        setOrders(Array.isArray(ords) ? ords : []);
        setCustomers(Array.isArray(custs) ? custs : []);
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        triggerNotification('Error loading admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, triggerNotification]);

  // Basic stats
  const totalRevenue = orders.reduce((sum, ord) => sum + (parseFloat(ord.total) || 0), 0);
  const stats = {
    revenue: `₹${totalRevenue.toLocaleString()}`,
    orders: orders.length,
    products: products.length,
    customers: customers.length
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
        triggerNotification('Product deleted successfully');
      } catch (err) {
        triggerNotification('Error deleting product');
      }
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
        triggerNotification('Category deleted successfully');
      } catch (err) {
        triggerNotification('Error deleting category');
      }
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      triggerNotification('Order status updated');
    } catch (err) {
      triggerNotification('Error updating order status');
    }
  };

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

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-surface-container text-primary">Loading Admin Data...</div>;
  }

  return (
    <div className="flex h-screen bg-surface-container text-left text-primary font-body-md overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-surface border-r border-outline-variant/30 flex flex-col">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
          <h1 className="font-display-lg text-xl tracking-widest uppercase text-primary">Admin</h1>
          <button onClick={() => navigateTo('home')} className="text-secondary hover:text-primary transition-colors bg-transparent border-none cursor-pointer" title="Go to Store">
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="flex flex-col gap-1 px-4">
            <button onClick={() => setActiveTab('dashboard')} className={`text-left px-4 py-3 rounded-md font-label-caps text-[10px] tracking-widest uppercase transition-colors bg-transparent border-none cursor-pointer ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'text-secondary hover:bg-surface-variant/30 hover:text-primary'}`}>Dashboard</button>
            <button onClick={() => setActiveTab('products')} className={`text-left px-4 py-3 rounded-md font-label-caps text-[10px] tracking-widest uppercase transition-colors bg-transparent border-none cursor-pointer ${activeTab === 'products' ? 'bg-primary text-white' : 'text-secondary hover:bg-surface-variant/30 hover:text-primary'}`}>Products</button>
            <button onClick={() => setActiveTab('orders')} className={`text-left px-4 py-3 rounded-md font-label-caps text-[10px] tracking-widest uppercase transition-colors bg-transparent border-none cursor-pointer ${activeTab === 'orders' ? 'bg-primary text-white' : 'text-secondary hover:bg-surface-variant/30 hover:text-primary'}`}>Orders</button>
            <button onClick={() => setActiveTab('customers')} className={`text-left px-4 py-3 rounded-md font-label-caps text-[10px] tracking-widest uppercase transition-colors bg-transparent border-none cursor-pointer ${activeTab === 'customers' ? 'bg-primary text-white' : 'text-secondary hover:bg-surface-variant/30 hover:text-primary'}`}>Customers</button>
            <button onClick={() => setActiveTab('categories')} className={`text-left px-4 py-3 rounded-md font-label-caps text-[10px] tracking-widest uppercase transition-colors bg-transparent border-none cursor-pointer ${activeTab === 'categories' ? 'bg-primary text-white' : 'text-secondary hover:bg-surface-variant/30 hover:text-primary'}`}>Categories</button>
            <button onClick={() => setActiveTab('inventory')} className={`text-left px-4 py-3 rounded-md font-label-caps text-[10px] tracking-widest uppercase transition-colors bg-transparent border-none cursor-pointer ${activeTab === 'inventory' ? 'bg-primary text-white' : 'text-secondary hover:bg-surface-variant/30 hover:text-primary'}`}>Inventory</button>
            <button onClick={() => setActiveTab('discounts')} className={`text-left px-4 py-3 rounded-md font-label-caps text-[10px] tracking-widest uppercase transition-colors bg-transparent border-none cursor-pointer ${activeTab === 'discounts' ? 'bg-primary text-white' : 'text-secondary hover:bg-surface-variant/30 hover:text-primary'}`}>Discounts</button>
            <button onClick={() => setActiveTab('transactions')} className={`text-left px-4 py-3 rounded-md font-label-caps text-[10px] tracking-widest uppercase transition-colors bg-transparent border-none cursor-pointer ${activeTab === 'transactions' ? 'bg-primary text-white' : 'text-secondary hover:bg-surface-variant/30 hover:text-primary'}`}>Transactions</button>
            <button onClick={() => setActiveTab('settings')} className={`text-left px-4 py-3 rounded-md font-label-caps text-[10px] tracking-widest uppercase transition-colors bg-transparent border-none cursor-pointer ${activeTab === 'settings' ? 'bg-primary text-white' : 'text-secondary hover:bg-surface-variant/30 hover:text-primary'}`}>Settings</button>
          </nav>
        </div>
        <div className="p-4 border-t border-outline-variant/30">
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-md font-label-caps text-[10px] tracking-widest uppercase transition-colors bg-transparent border-none cursor-pointer text-muted-terracotta hover:bg-surface-variant/30">Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-surface-container-low p-8">
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="font-headline-sm text-2xl font-bold mb-6 text-primary">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 border border-outline-variant/30 rounded-lg shadow-sm">
                <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase mb-2">Total Revenue</p>
                <p className="font-price-lg text-2xl font-bold text-primary">{stats.revenue}</p>
              </div>
              <div className="bg-white p-6 border border-outline-variant/30 rounded-lg shadow-sm">
                <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase mb-2">Orders</p>
                <p className="font-display-lg text-2xl font-bold text-primary">{stats.orders}</p>
              </div>
              <div className="bg-white p-6 border border-outline-variant/30 rounded-lg shadow-sm">
                <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase mb-2">Products</p>
                <p className="font-display-lg text-2xl font-bold text-primary">{stats.products}</p>
              </div>
              <div className="bg-white p-6 border border-outline-variant/30 rounded-lg shadow-sm">
                <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase mb-2">Customers</p>
                <p className="font-display-lg text-2xl font-bold text-primary">{stats.customers}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-sm text-2xl font-bold text-primary">Products</h2>
              <button onClick={() => handleOpenProductModal()} className="bg-primary text-white font-label-caps text-[10px] uppercase tracking-widest px-6 py-3 hover:bg-secondary transition-colors border-none cursor-pointer rounded-sm">Add Product</button>
            </div>
            <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-surface-variant/30 border-b border-outline-variant/30 font-label-caps text-[10px] text-secondary tracking-widest uppercase">
                  <tr>
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm">
                  {products.map(prod => (
                    <tr key={prod.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <img src={prod.imageMain} alt={prod.title} className="w-10 h-10 object-cover rounded-sm border border-outline-variant/20" />
                        <span className="font-bold text-primary">{prod.title}</span>
                      </td>
                      <td className="py-4 px-6 text-secondary">{prod.category}</td>
                      <td className="py-4 px-6 font-price-lg font-bold">₹{prod.price}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 text-[9px] font-label-caps uppercase rounded-sm ${prod.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {prod.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => handleOpenProductModal(prod)} className="text-[10px] font-label-caps uppercase text-primary hover:text-muted-terracotta transition-colors bg-transparent border-none cursor-pointer mr-3">Edit</button>
                        <button onClick={() => handleDeleteProduct(prod.id)} className="text-[10px] font-label-caps uppercase text-muted-terracotta hover:text-red-700 transition-colors bg-transparent border-none cursor-pointer">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-secondary">No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="font-headline-sm text-2xl font-bold mb-6 text-primary">Orders</h2>
            <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-surface-variant/30 border-b border-outline-variant/30 font-label-caps text-[10px] text-secondary tracking-widest uppercase">
                  <tr>
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Total</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-6 font-bold text-primary">#{order.id.slice(0, 8)}</td>
                      <td className="py-4 px-6 text-secondary">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                        <div className="font-bold">{order.customer_name}</div>
                        <div className="text-xs text-secondary">{order.customer_email}</div>
                      </td>
                      <td className="py-4 px-6 font-price-lg font-bold">₹{order.total}</td>
                      <td className="py-4 px-6">
                        <select 
                          value={order.status} 
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="bg-transparent border border-outline-variant/30 rounded px-2 py-1 text-xs font-label-caps uppercase text-primary outline-none focus:border-primary"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-right flex items-center justify-end gap-3">
                        <a href={`http://localhost:3001/api/orders/${order.id}/slip`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-label-caps uppercase text-primary hover:text-muted-terracotta transition-colors bg-transparent border-none cursor-pointer">
                          Print Slip
                        </a>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-secondary">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div>
            <h2 className="font-headline-sm text-2xl font-bold mb-6 text-primary">Customers</h2>
            <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-surface-variant/30 border-b border-outline-variant/30 font-label-caps text-[10px] text-secondary tracking-widest uppercase">
                  <tr>
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Phone</th>
                    <th className="py-4 px-6">Orders</th>
                    <th className="py-4 px-6">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm">
                  {customers.map(customer => (
                    <tr key={customer.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-6 font-bold text-primary">{customer.name}</td>
                      <td className="py-4 px-6 text-secondary">{customer.email}</td>
                      <td className="py-4 px-6 text-secondary">{customer.phone || '-'}</td>
                      <td className="py-4 px-6">{customer.total_orders || 0}</td>
                      <td className="py-4 px-6 font-price-lg font-bold">₹{customer.total_spent || 0}</td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-secondary">No customers found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-sm text-2xl font-bold text-primary">Categories</h2>
              <button onClick={() => handleOpenCategoryModal()} className="bg-primary text-white font-label-caps text-[10px] uppercase tracking-widest px-6 py-3 hover:bg-secondary transition-colors border-none cursor-pointer rounded-sm">Add Category</button>
            </div>
            <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-surface-variant/30 border-b border-outline-variant/30 font-label-caps text-[10px] text-secondary tracking-widest uppercase">
                  <tr>
                    <th className="py-4 px-6">Image</th>
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Slug</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm">
                  {categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-6">
                        {cat.image_url ? (
                          <img src={cat.image_url} alt={cat.name} className="w-10 h-10 object-cover rounded-sm border border-outline-variant/20" />
                        ) : (
                          <div className="w-10 h-10 bg-surface-variant rounded-sm border border-outline-variant/20 flex items-center justify-center text-[10px] text-secondary">No Img</div>
                        )}
                      </td>
                      <td className="py-4 px-6 font-bold text-primary">{cat.name}</td>
                      <td className="py-4 px-6 text-secondary">{cat.slug}</td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => handleOpenCategoryModal(cat)} className="text-[10px] font-label-caps uppercase text-primary hover:text-muted-terracotta transition-colors bg-transparent border-none cursor-pointer mr-3">Edit</button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="text-[10px] font-label-caps uppercase text-muted-terracotta hover:text-red-700 transition-colors bg-transparent border-none cursor-pointer">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-secondary">No categories found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div>
            <h2 className="font-headline-sm text-2xl font-bold mb-6 text-primary">Inventory</h2>
            <div className="bg-white p-8 border border-outline-variant/30 rounded-lg shadow-sm text-center text-secondary">
              <p>Inventory management coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'discounts' && (
          <div>
            <h2 className="font-headline-sm text-2xl font-bold mb-6 text-primary">Discounts</h2>
            <div className="bg-white p-8 border border-outline-variant/30 rounded-lg shadow-sm text-center text-secondary">
              <p>Discounts management coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div>
            <h2 className="font-headline-sm text-2xl font-bold mb-6 text-primary">Transactions</h2>
            <div className="bg-white p-8 border border-outline-variant/30 rounded-lg shadow-sm text-center text-secondary">
              <p>Transactions management coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="font-headline-sm text-2xl font-bold mb-6 text-primary">Site Settings</h2>
            <div className="bg-white p-8 border border-outline-variant/30 rounded-lg shadow-sm text-center text-secondary">
              <p>Settings management coming soon...</p>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-headline-sm text-2xl font-bold mb-6 text-primary">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Title</label>
                  <input required className="w-full border border-outline-variant/30 p-2 text-sm bg-transparent outline-none focus:border-primary" value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} />
                </div>
                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Category</label>
                  <select required className="w-full border border-outline-variant/30 p-2 text-sm bg-transparent outline-none focus:border-primary" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                    <option value="">Select...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Price</label>
                  <input type="number" required className="w-full border border-outline-variant/30 p-2 text-sm bg-transparent outline-none focus:border-primary" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
                </div>
                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Original Price</label>
                  <input type="number" className="w-full border border-outline-variant/30 p-2 text-sm bg-transparent outline-none focus:border-primary" value={productForm.originalPrice} onChange={e => setProductForm({...productForm, originalPrice: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Main Image URL</label>
                  <input required className="w-full border border-outline-variant/30 p-2 text-sm bg-transparent outline-none focus:border-primary" value={productForm.imageMain} onChange={e => setProductForm({...productForm, imageMain: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Hover Image URL</label>
                  <input required className="w-full border border-outline-variant/30 p-2 text-sm bg-transparent outline-none focus:border-primary" value={productForm.imageHover} onChange={e => setProductForm({...productForm, imageHover: e.target.value})} />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" checked={productForm.inStock} onChange={e => setProductForm({...productForm, inStock: e.target.checked})} id="inStockCheckbox" className="accent-primary" />
                  <label htmlFor="inStockCheckbox" className="font-label-caps text-[10px] tracking-widest uppercase cursor-pointer">In Stock</label>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => setShowProductModal(false)} className="px-6 py-2 border border-outline-variant/30 font-label-caps text-[10px] tracking-widest uppercase hover:bg-surface-variant/30 transition-colors cursor-pointer bg-transparent">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-white font-label-caps text-[10px] tracking-widest uppercase hover:bg-secondary transition-colors cursor-pointer border-none">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-headline-sm text-2xl font-bold mb-6 text-primary">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSaveCategory} className="space-y-4 text-left">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Name</label>
                  <input required className="w-full border border-outline-variant/30 p-2 text-sm bg-transparent outline-none focus:border-primary" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} />
                </div>
                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Slug</label>
                  <input required className="w-full border border-outline-variant/30 p-2 text-sm bg-transparent outline-none focus:border-primary" value={categoryForm.slug} onChange={e => setCategoryForm({...categoryForm, slug: e.target.value})} />
                </div>
                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Image URL</label>
                  <input className="w-full border border-outline-variant/30 p-2 text-sm bg-transparent outline-none focus:border-primary" value={categoryForm.image_url} onChange={e => setCategoryForm({...categoryForm, image_url: e.target.value})} />
                </div>
                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Description</label>
                  <textarea className="w-full border border-outline-variant/30 p-2 text-sm bg-transparent outline-none focus:border-primary resize-y" rows="3" value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="px-6 py-2 border border-outline-variant/30 font-label-caps text-[10px] tracking-widest uppercase hover:bg-surface-variant/30 transition-colors cursor-pointer bg-transparent">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-white font-label-caps text-[10px] tracking-widest uppercase hover:bg-secondary transition-colors cursor-pointer border-none">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
