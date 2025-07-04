// File: bootstrap/app.js
const express = require('express');
const path = require('path');
const flash = require('connect-flash');
const { UserLogModel } = require('../databases/models');
const cors = require('cors');
// Config dan core
const helmet = require('../config/helmet');
const session = require('../config/session');
const csrfMiddleware = require('../middlewares/csrf');
const logger = require('../middlewares/logger');
const globalLocals = require('../middlewares/globals');
const monitor = require('../middlewares/monitor');
const loadRoutes = require('../core/routes');
const errorHandlerCsrf = require('../middlewares/errorHandlerCsrf');
const { isAuthenticated } = require('../middlewares/auth');
require('dotenv').config();


const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || `http://localhost`;
const app = express();

// ─── MIDDLEWARE: Dasar ───────────────────────────────────────────────
app.use(helmet); // Helmet & CSP
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors({
  origin: `${hostname}:${port}`
}));
app.use(flash());
app.use(session);
app.use(csrfMiddleware);

// ─── MIDDLEWARE: Error Handler untuk CSRF ────────────────────────────
app.use(errorHandlerCsrf);
// ─── MIDDLEWARE: Global res.locals ──────────────────────────────────
app.use(globalLocals);
// ─── LOGS ACTIVIY ──────────────────────────────────
app.use((req, res, next) => {
  if (req.session?.user) {
    UserLogModel.create({
      user_id: req.session.user.id,
      action: 'akses_' + req.originalUrl.replace(/\//g, '_'),
      description: `Mengakses ${req.originalUrl}`,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      created_at: new Date()
    }).catch(console.error);
  }
  next();
});

app.use(monitor); 
app.get('/monitor',isAuthenticated, (req, res) => {
  res.json(monitor.getStatus());
});

// ─── VIEW ENGINE ─────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// ─── ROUTING ─────────────────────────────────────────────────────────
loadRoutes(app);

module.exports = app;
