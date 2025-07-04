const { hasPermission } = require('../helpers/permissions');

module.exports = (slug, permission) => {
  return async (req, res, next) => {
    const user = req.session.user;

    if (!user) return res.status(401).render('errors/unauthorized'); // Optional: bisa juga redirect login

    const allowed = await hasPermission(user, slug, permission);
    if (!allowed) {
      return res.status(403).render('errors/forbidden', {
        title: 'Akses Ditolak',
        user,
        slug,
        permission
      });
    }

    next();
  };
};
