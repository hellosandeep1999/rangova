const BASE = 'http://localhost:3001/api';

function getToken() {
  return sessionStorage.getItem('rangova_admin_token');
}

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
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
export async function getProducts() {
  const res = await fetch(`${BASE}/products`);
  return res.json();
}

export async function createProduct(data) {
  const res = await fetch(`${BASE}/products`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateProduct(id, data) {
  const res = await fetch(`${BASE}/products/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteProduct(id) {
  const res = await fetch(`${BASE}/products/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── CATEGORIES ────────────────────────────────────────
export async function getCategories() {
  const res = await fetch(`${BASE}/categories`);
  return res.json();
}

export async function createCategory(data) {
  const res = await fetch(`${BASE}/categories`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateCategory(id, data) {
  const res = await fetch(`${BASE}/categories/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteCategory(id) {
  const res = await fetch(`${BASE}/categories/${id}`, { method: 'DELETE', headers: authHeaders() });
  return res.json();
}

// ── ORDERS ────────────────────────────────────────────
export async function getOrders(status = '') {
  const url = status ? `${BASE}/orders?status=${status}` : `${BASE}/orders`;
  const res = await fetch(url, { headers: authHeaders() });
  return res.json();
}

export async function placeOrder(data) {
  const res = await fetch(`${BASE}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateOrderStatus(id, status) {
  const res = await fetch(`${BASE}/orders/${id}/status`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function getOrderSlipUrl(id) {
  return `${BASE}/orders/${id}/slip`;
}

// ── CUSTOMERS ─────────────────────────────────────────
export async function getCustomers() {
  const res = await fetch(`${BASE}/customers`, { headers: authHeaders() });
  return res.json();
}

export async function getCustomerOrders(id) {
  const res = await fetch(`${BASE}/customers/${id}/orders`, { headers: authHeaders() });
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
export async function getSetting(key) {
  const res = await fetch(`${BASE}/settings/${key}`);
  if (!res.ok) return null;
  return res.json();
}

export async function updateSetting(key, value) {
  const res = await fetch(`${BASE}/settings/${key}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ value }) });
  return res.json();
}
