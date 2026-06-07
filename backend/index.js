require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const ordersRoutes = require('./routes/orders');
const customersRoutes = require('./routes/customers');
const inventoryRoutes = require('./routes/inventory');
const discountsRoutes = require('./routes/discounts');
const settingsRoutes = require('./routes/settings');
const transactionsRoutes = require('./routes/transactions');
const activityRoutes = require('./routes/activity');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/discounts', discountsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/activity', activityRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Rangova API running on http://localhost:${PORT}`));
