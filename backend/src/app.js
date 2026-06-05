const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes  = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes  = require('./routes/user.routes');
const ownerRoutes = require('./routes/owner.routes');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth',  authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user',  userRoutes);
app.use('/api/owner', ownerRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = app;
