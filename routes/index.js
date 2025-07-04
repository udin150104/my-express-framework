const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { isAuthenticated, isGuest } = require('../middlewares/auth');
const onlyAllow = require('../middlewares/onlyAllow');
const loadControllers = require('../core/loadControllers');
const controllers = loadControllers();

const upload = multer({ dest: path.join(__dirname, '../databases/restores') });

router.get('/favicon.ico', (req, res) => res.status(204));
router.get('/', controllers['HomeController'].index);
/**
 * Auth
 */
router.get('/auth/login', isGuest, controllers['auth/AuthController'].login);
router.post('/auth/login', isGuest, controllers['auth/AuthController'].loginPost);
router.get('/auth/logout', isAuthenticated, controllers['auth/AuthController'].logout);/**
 * Profile
 */
router.get('/profile/edit', isAuthenticated, controllers['ProfileController'].edit);
router.post('/profile/update', isAuthenticated, controllers['ProfileController'].update);
/**
 * Dashboard
 */
router.get('/dashboard', [isAuthenticated,onlyAllow('dashboard', 'access')], controllers['DashboardController'].index);
/** Log Activity */
router.get('/log-activity', [isAuthenticated,onlyAllow('log-activity', 'access')], controllers['LogActivityController'].index);
router.get('/api/log-activity', [isAuthenticated,onlyAllow('log-activity', 'access')], controllers['LogActivityController'].apiget);
/** Notification */
router.get('/notifications', [isAuthenticated,onlyAllow('notification', 'access')], controllers['NotificationController'].index);
router.get('/api/notifications/:id', [isAuthenticated,onlyAllow('notification', 'access')], controllers['NotificationController'].getDetail);
/** Ringkasan */
router.get('/sistem/ringkasan', [isAuthenticated,onlyAllow('sistem.ringkasan', 'access')], controllers['SistemRingakasanController'].index);
router.get('/sistem/ringkasan/backup', [isAuthenticated,onlyAllow('sistem.ringkasan', 'access')], controllers['SistemRingakasanController'].backup);
router.post('/sistem/ringkasan/restore', [isAuthenticated,onlyAllow('sistem.ringkasan', 'access'),upload.single('restoreFile')], controllers['SistemRingakasanController'].restore);
router.post('/sistem/ringkasan/reset-log', [isAuthenticated,onlyAllow('sistem.ringkasan', 'access')], controllers['SistemRingakasanController'].resetLog);
/**
 * pengaturan user/pengguna
 */
router.get('/pengaturan/users', [isAuthenticated,onlyAllow('pengaturan.pengguna', 'access')], controllers['UsersController'].index);
router.get('/pengaturan/users/create', [isAuthenticated,onlyAllow('pengaturan.pengguna', 'create')], controllers['UsersController'].create);
router.get('/pengaturan/users/:id/permission', [isAuthenticated,onlyAllow('pengaturan.pengguna', 'create')], controllers['UsersController'].permission);
router.post('/pengaturan/users/save', [isAuthenticated,onlyAllow('pengaturan.pengguna', 'create')], controllers['UsersController'].save);
router.get('/pengaturan/users/:id/edit', [isAuthenticated,onlyAllow('pengaturan.pengguna', 'edit')], controllers['UsersController'].edit);
router.post('/pengaturan/users/:id/update', [isAuthenticated,onlyAllow('pengaturan.pengguna', 'edit')], controllers['UsersController'].update);
router.delete('/api/pengaturan/users/:id', [isAuthenticated,onlyAllow('pengaturan.pengguna', 'delete')], controllers['UsersController'].destroy);
router.get('/api/pengaturan/users', [isAuthenticated,onlyAllow('pengaturan.pengguna', 'access')], controllers['UsersController'].apiget);
router.post('/pengaturan/permission/saveUpdateUser', [isAuthenticated,onlyAllow('pengaturan.pengguna', 'setpermission')], controllers['PermissionController'].saveUpdateUser);
/**
 * pengaturan permission
 */
router.get('/pengaturan/permission', [isAuthenticated,onlyAllow('pengaturan.permission', 'access')], controllers['PermissionController'].index);
router.post('/pengaturan/permission/saveUpdate', [isAuthenticated,onlyAllow('pengaturan.permission', 'set')], controllers['PermissionController'].saveUpdate);
router.get('/api/pengaturan/permissions-role/:role', [isAuthenticated,onlyAllow('pengaturan.permission', 'access')], controllers['PermissionController'].apipermissionrole);

module.exports = router;
