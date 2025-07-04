// middlewares/auth.js

module.exports = {
  // Cek apakah user sudah login
  isAuthenticated: (req, res, next) => {
    if (req.session && req.session.user) {
      return next(); // lanjut ke controller
    }
    req.flash('error', 'Silakan login terlebih dahulu.');
    res.redirect('/auth/login');
  },

  // Cegah akses halaman login jika sudah login
  isGuest: (req, res, next) => {
    if (req.session && req.session.user) {
      return res.redirect('/dashboard');
    }
    next();
  }
};
