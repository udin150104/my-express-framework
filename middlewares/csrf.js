// middlewares/csrf.js
const csrf = require('csurf');

// Buat instance middleware CSRF
const csrfProtection = csrf();

// Middleware yang bisa dipakai di app
module.exports = [
  csrfProtection,
  (req, res, next) => {
    // Inject token ke variabel EJS
    res.locals.csrfToken = req.csrfToken();
    next();
  }
];
