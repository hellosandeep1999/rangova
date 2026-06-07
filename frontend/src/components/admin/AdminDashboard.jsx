import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard({ stats, chartFilter, setChartFilter, chartData }) {
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="font-headline-sm text-2xl font-bold text-primary">Dashboard Overview</h2>
        <div className="flex gap-2">
          {['today', '7days', '30days'].map(f => (
            <button 
              key={f}
              onClick={() => setChartFilter(f)}
              className={`px-4 py-2 text-[10px] font-label-caps uppercase tracking-widest border border-outline-variant/30 rounded-sm cursor-pointer transition-colors ${chartFilter === f ? 'bg-primary text-white' : 'bg-transparent text-secondary hover:text-primary hover:bg-surface-variant/30'}`}
            >
              {f === 'today' ? 'Today' : f === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-4 md:p-6 border border-outline-variant/30 rounded-lg shadow-sm">
          <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase mb-2">Revenue</p>
          <p className="font-price-lg text-xl md:text-2xl font-bold text-primary">{stats.revenue}</p>
        </div>
        <div className="bg-white p-4 md:p-6 border border-outline-variant/30 rounded-lg shadow-sm">
          <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase mb-2">Orders</p>
          <p className="font-display-lg text-xl md:text-2xl font-bold text-primary">{stats.orders}</p>
        </div>
        <div className="bg-white p-4 md:p-6 border border-outline-variant/30 rounded-lg shadow-sm">
          <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase mb-2">Avg Order Val</p>
          <p className="font-price-lg text-xl md:text-2xl font-bold text-primary">{stats.aov}</p>
        </div>
        <div className="bg-white p-4 md:p-6 border border-outline-variant/30 rounded-lg shadow-sm">
          <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase mb-2">Conversion</p>
          <p className="font-display-lg text-xl md:text-2xl font-bold text-primary">{stats.conversion}</p>
        </div>
        <div className="bg-white p-4 md:p-6 border border-outline-variant/30 rounded-lg shadow-sm">
          <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase mb-2">Pending Orders</p>
          <p className="font-display-lg text-xl md:text-2xl font-bold text-[#854D0E]">{stats.pendingOrders || 0}</p>
        </div>
        <div className="bg-white p-4 md:p-6 border border-outline-variant/30 rounded-lg shadow-sm">
          <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase mb-2">Shipped Orders</p>
          <p className="font-display-lg text-xl md:text-2xl font-bold text-[#0369A1]">{stats.shippedOrders || 0}</p>
        </div>
        <div className="bg-white p-4 md:p-6 border border-outline-variant/30 rounded-lg shadow-sm">
          <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase mb-2">Cancelled</p>
          <p className="font-display-lg text-xl md:text-2xl font-bold text-[#991B1B]">{stats.cancelledOrders || 0}</p>
        </div>
        <div className="bg-white p-4 md:p-6 border border-outline-variant/30 rounded-lg shadow-sm">
          <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase mb-2">Products</p>
          <p className="font-display-lg text-xl md:text-2xl font-bold text-primary">{stats.products}</p>
        </div>
        <div className="bg-white p-4 md:p-6 border border-outline-variant/30 rounded-lg shadow-sm">
          <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase mb-2">Customers</p>
          <p className="font-display-lg text-xl md:text-2xl font-bold text-primary">{stats.customers}</p>
        </div>
        <div className="bg-white p-4 md:p-6 border border-outline-variant/30 rounded-lg shadow-sm">
          <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase mb-2 flex items-center gap-1">Low Stock <span className="material-symbols-outlined text-[10px] text-muted-terracotta">warning</span></p>
          <p className="font-display-lg text-xl md:text-2xl font-bold text-muted-terracotta">{stats.lowStock}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 border border-outline-variant/30 rounded-lg shadow-sm">
          <h3 className="font-label-caps text-[12px] text-secondary tracking-widest uppercase mb-6">Revenue Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#4a5568" strokeWidth={3} dot={{ r: 4, fill: '#4a5568', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 border border-outline-variant/30 rounded-lg shadow-sm">
          <h3 className="font-label-caps text-[12px] text-secondary tracking-widest uppercase mb-6">Orders Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f4f4f5' }}
                />
                <Bar dataKey="orders" fill="#a0aec0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
