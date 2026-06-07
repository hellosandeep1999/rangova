import React from 'react';

export default function AdminSidebar({ 
  isSidebarCollapsed, 
  setIsSidebarCollapsed, 
  activeTab, 
  setActiveTab, 
  navigateTo, 
  onLogout 
}) {
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 md:hidden ${isSidebarCollapsed ? 'hidden' : 'block'}`} 
        onClick={() => setIsSidebarCollapsed(true)}
      ></div>
      
      {/* Sidebar */}
      <div className={`${isSidebarCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 w-64'} transition-all duration-300 fixed md:relative z-50 h-full bg-surface border-r border-outline-variant/30 flex flex-col`}>
        <div className={`p-6 border-b border-outline-variant/30 flex ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} items-center`}>
          {!isSidebarCollapsed && <h1 className="font-display-lg text-xl tracking-widest uppercase text-primary">Admin</h1>}
          <div className="flex gap-2">
            {!isSidebarCollapsed && (
              <button onClick={() => navigateTo('home')} className="text-secondary hover:text-primary transition-colors bg-transparent border-none cursor-pointer" title="Go to Store">
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            )}
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden md:block text-secondary hover:text-primary transition-colors bg-transparent border-none cursor-pointer" title="Toggle Sidebar">
              <span className="material-symbols-outlined text-sm">{isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="flex flex-col gap-1 px-4">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
              { id: 'products', label: 'Products', icon: 'inventory_2' },
              { id: 'orders', label: 'Orders', icon: 'shopping_cart' },
              { id: 'customers', label: 'Customers', icon: 'group' },
              { id: 'categories', label: 'Categories', icon: 'category' },
              { id: 'inventory', label: 'Inventory', icon: 'warehouse' },
              { id: 'discounts', label: 'Discounts', icon: 'local_offer' },
              { id: 'transactions', label: 'Transactions', icon: 'receipt_long' },
              { id: 'settings', label: 'Settings', icon: 'settings' },
              { id: 'activity', label: 'Activity Log', icon: 'history' },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if (window.innerWidth < 768) setIsSidebarCollapsed(true); }} 
                title={isSidebarCollapsed ? tab.label : ''}
                style={activeTab === tab.id ? { backgroundColor: '#1b1c1c', color: '#ffffff' } : {}}
                className={`text-left px-4 py-3 flex items-center gap-3 rounded-md font-label-caps text-[10px] tracking-widest uppercase transition-colors bg-transparent border-none cursor-pointer ${activeTab === tab.id ? 'shadow-md' : 'text-secondary hover:bg-surface-variant/50 hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                {!isSidebarCollapsed && <span>{tab.label}</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-outline-variant/30 flex justify-center">
          <button onClick={onLogout} title={isSidebarCollapsed ? 'Logout' : ''} className={`w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'} flex items-center gap-3 py-3 rounded-md font-label-caps text-[10px] tracking-widest uppercase transition-colors bg-transparent border-none cursor-pointer text-muted-terracotta hover:bg-surface-variant/30`}>
            <span className="material-symbols-outlined text-lg">logout</span>
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
}
