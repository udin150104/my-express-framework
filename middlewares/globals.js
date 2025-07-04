// middlewares/globals.js
const helpers = require('../helpers');
const path = require('path');
const fs = require('fs');
const { hasPermission } = require('../helpers/permissions');
const { NotificationModel } = require('../databases/models');
const menusPath = path.join(__dirname, './../config/menus.json');
const menus = JSON.parse(fs.readFileSync(menusPath, 'utf8'));


module.exports = async (req, res, next) => {
  try {
    res.locals.error = JSON.parse(req.flash('error')[0] || '{}');
  } catch {
    res.locals.error = {};
  }

  try {
    res.locals.old = JSON.parse(req.flash('old')[0] || '{}');
  } catch {
    res.locals.old = {};
  }
  try {
    res.locals.success = JSON.parse(req.flash('success')[0] || '{}');
  } catch {
    res.locals.success = {};
  }

  res.locals.helpers = helpers;
  res.locals.csrfToken = req.csrfToken ? req.csrfToken() : '';
  res.locals.session = req.session;
  res.locals.currentPath = req.path;
  res.locals.menus = menus;

  const userData = req.session.user;
  const permissions = {};

  async function processMenu(menu) {
    if (!menu.slug || !Array.isArray(menu.permission)) return;

    permissions[menu.slug] = {};

    for (const perm of menu.permission) {
      const allowed = await hasPermission(userData, menu.slug, perm);
      permissions[menu.slug][perm] = allowed;
    }

    if (menu.children) {
      for (const child of menu.children) {
        await processMenu(child);
      }
    }
  }

  for (const menu of menus) {
    await processMenu(menu);
  }

  res.locals.permissions = permissions;

  // Helper untuk EJS
  res.locals.hasPerm = (slug, action) => {
    return permissions?.[slug]?.[action] === true;
  };
  if (req.session.user) {
    res.locals.notifications_notif = await NotificationModel.findAll({
      where: { user_id: req.session.user?.id, is_read: 0 },
      order: [['created_at', 'DESC']],
      limit: 10
    });
  }

  next();
};
