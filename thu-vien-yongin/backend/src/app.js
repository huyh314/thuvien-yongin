const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const config = require('./config');
const authRoutes = require('./modules/auth/routes/authRoutes');
const catalogingRoutes = require('./modules/cataloging/routes/catalogingRoutes');
const circulationRoutes = require('./modules/circulation/routes/circulationRoutes');
const patronRoutes = require('./modules/patron/routes/patronRoutes');
const opacRoutes = require('./modules/opac/routes/opacRoutes');
const collectionRoutes = require('./modules/collection/routes/collectionRoutes');
const adminRoutes = require('./modules/admin/routes/adminRoutes');
const acquisitionRoutes = require('./modules/acquisition/routes/acquisitionRoutes');
const holdsRoutes = require('./modules/circulation/routes/holdsRoutes');

const app = express();

// ─── Serve static frontend (3 portals - React build) ───
const path = require('path');
const reactDist = path.join(__dirname, '../../frontend/apps');
app.use(express.static(path.join(reactDist, 'reader/dist')));
app.use('/librarian', express.static(path.join(reactDist, 'librarian/dist')));
app.use('/admin', express.static(path.join(reactDist, 'admin/dist')));

// ─── Security Middleware ───
app.use(helmet({
  contentSecurityPolicy: false, // allow React inline scripts
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───
app.use('/api/auth', authRoutes);
app.use('/api/cataloging', catalogingRoutes);
app.use('/api/circulation', circulationRoutes);
app.use('/api/patron', patronRoutes);
app.use('/api/opac', opacRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/acquisition', acquisitionRoutes);
app.use('/api/holds', holdsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Thư viện Yongin API',
    version: '1.0.0',
  });
});

// ─── SPA Fallback for React apps ───
// Reader portal: redirect all non-API, non-static requests to index.html
app.get(/^\/(?!api\/|librarian|admin)/, (req, res) => {
  res.sendFile(path.join(reactDist, 'reader/dist/index.html'));
});
app.get('/librarian/*', (req, res) => {
  res.sendFile(path.join(reactDist, 'librarian/dist/index.html'));
});
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(reactDist, 'admin/dist/index.html'));
});

// ─── 404 Handler ───
app.use((req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: 'Endpoint không tồn tại.' });
});

// ─── Error Handler ───
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống không xác định.' });
});

// ─── Start Server ───
app.listen(config.port, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   📚 Thư viện Yongin API                    ║
  ║   Port: ${config.port}                          ║
  ║   Env: ${config.nodeEnv}                        ║
  ║   ${config.library.name} ║
  ╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;
