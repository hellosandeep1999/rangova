import { createClient } from '@supabase/supabase-js';

const BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

function getToken() {
  return sessionStorage.getItem('rangova_admin_token');
}

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
}

async function handleResponse(res) {
  if (res.status === 401 || res.status === 403) {
    adminLogout();
    throw new Error('Token expired. Please log in again.');
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── STORAGE ───────────────────────────────────────────
export async function uploadFileToSupabase(bucket, file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);

  if (error) {
    throw error;
  }

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return publicData.publicUrl;
}

// ── AUTH ──────────────────────────────────────────────
export async function adminLogin(username, password) {
  const res = await fetch(`${BASE}/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const { token } = await res.json();
  sessionStorage.setItem('rangova_admin_token', token);
  return token;
}

export function adminLogout() {
  sessionStorage.removeItem('rangova_admin_token');
}

export function isAdminLoggedIn() {
  return !!getToken();
}

// ── PRODUCTS ─────────────────────────────────────────
export async function getProducts(admin = false) {
  const url = admin ? `${BASE}/products?admin=true` : `${BASE}/products`;
  const res = await fetch(url);
  return res.json();
}

export async function createProduct(data) {
  const res = await fetch(`${BASE}/products`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  return handleResponse(res);
}

export async function updateProduct(id, data) {
  const res = await fetch(`${BASE}/products/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  return handleResponse(res);
}

export async function deleteProduct(id) {
  const res = await fetch(`${BASE}/products/${id}`, { method: 'DELETE', headers: authHeaders() });
  return handleResponse(res);
}

// ── CATEGORIES ────────────────────────────────────────
export async function getCategories() {
  const res = await fetch(`${BASE}/categories`);
  return res.json();
}

export async function createCategory(data) {
  const res = await fetch(`${BASE}/categories`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  return handleResponse(res);
}

export async function updateCategory(id, data) {
  const res = await fetch(`${BASE}/categories/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  return handleResponse(res);
}

export async function deleteCategory(id) {
  const res = await fetch(`${BASE}/categories/${id}`, { method: 'DELETE', headers: authHeaders() });
  return handleResponse(res);
}

// ── ORDERS ────────────────────────────────────────────
export async function getOrders(status = '') {
  const url = status ? `${BASE}/orders?status=${status}` : `${BASE}/orders`;
  const res = await fetch(url, { headers: authHeaders() });
  return handleResponse(res);
}

export async function placeOrder(data) {
  const res = await fetch(`${BASE}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateOrderStatus(id, status) {
  const res = await fetch(`${BASE}/orders/${id}/status`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }) });
  return handleResponse(res);
}

export function getOrderSlipUrl(id) {
  return `${BASE}/orders/${id}/slip`;
}

// ── CUSTOMERS ─────────────────────────────────────────
export async function getCustomers() {
  const res = await fetch(`${BASE}/customers`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getCustomerOrders(id) {
  const res = await fetch(`${BASE}/customers/${id}/orders`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function updateCustomerStatus(id, status) {
  const res = await fetch(`${BASE}/customers/${id}/status`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }) });
  return handleResponse(res);
}

export async function getOrdersByEmail(email) {
  const res = await fetch(`${BASE}/customers/orders-by-email/${encodeURIComponent(email)}`);
  if (!res.ok) return [];
  return res.json();
}

// ── INVENTORY ─────────────────────────────────────────
export async function getInventory() {
  const res = await fetch(`${BASE}/inventory`, { headers: authHeaders() });
  return res.json();
}

export async function updateInventory(id, stock_qty) {
  const res = await fetch(`${BASE}/inventory/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ stock_qty }) });
  return res.json();
}

export async function addInventory(data) {
  const res = await fetch(`${BASE}/inventory`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  return res.json();
}

export async function deleteInventory(id) {
  const res = await fetch(`${BASE}/inventory/${id}`, { method: 'DELETE', headers: authHeaders() });
  return res.json();
}

// ── DISCOUNTS ─────────────────────────────────────────
export async function getDiscounts() {
  const res = await fetch(`${BASE}/discounts`, { headers: authHeaders() });
  return res.json();
}

export async function getActiveDiscount() {
  const res = await fetch(`${BASE}/discounts/active`);
  if (!res.ok) return null;
  return res.json();
}

export async function createDiscount(data) {
  const res = await fetch(`${BASE}/discounts`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  return res.json();
}

export async function updateDiscount(id, data) {
  const res = await fetch(`${BASE}/discounts/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  return res.json();
}

export async function deleteDiscount(id) {
  const res = await fetch(`${BASE}/discounts/${id}`, { method: 'DELETE', headers: authHeaders() });
  return res.json();
}

// ── TRANSACTIONS ──────────────────────────────────────
export async function getTransactions() {
  const res = await fetch(`${BASE}/transactions`, { headers: authHeaders() });
  return res.json();
}

// ── SETTINGS ──────────────────────────────────────────
export async function getAllSettings() {
  const res = await fetch(`${BASE}/settings`);
  if (!res.ok) return {};
  return res.json();
}

export async function getShippingSettings() {
  try {
    const settings = await getAllSettings();
    return {
      threshold: parseFloat(settings.free_shipping_threshold) || 999,
      charge: parseFloat(settings.shipping_charge) || 50
    };
  } catch {
    return { threshold: 999, charge: 50 };
  }
}

export async function getSetting(key) {
  const res = await fetch(`${BASE}/settings/${key}`);
  if (!res.ok) return null;
  return res.json();
}

export async function updateSetting(key, value) {
  const res = await fetch(`${BASE}/settings/${key}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ value }) });
  return res.json();
}

// ── ACTIVITY LOGS ─────────────────────────────────────
export async function getActivityLogs() {
  const res = await fetch(`${BASE}/activity`, { headers: authHeaders() });
  return handleResponse(res);
}

// ── TESTIMONIALS ──────────────────────────────────────
export async function getTestimonials() {
  const res = await fetch(`${BASE}/testimonials`);
  if (!res.ok) return [];
  return res.json();
}

export async function createTestimonial(data) {
  const res = await fetch(`${BASE}/testimonials`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  return handleResponse(res);
}

export async function updateTestimonial(id, data) {
  const res = await fetch(`${BASE}/testimonials/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  return handleResponse(res);
}

export async function deleteTestimonial(id) {
  const res = await fetch(`${BASE}/testimonials/${id}`, { method: 'DELETE', headers: authHeaders() });
  return handleResponse(res);
}
