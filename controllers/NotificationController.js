const ejs = require('ejs');
const fs = require('fs').promises;
const path = require('path');
const { NotificationModel, userModel } = require('../databases/models');
const { Op } = require('sequelize');
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.index = async (req, res) => {
  let limit = 5;
  let offset = parseInt(req.query.op) || 0;
  let type = req.query.type || 'all';
  let totalall;

  const user = req.session.user; // pastikan ini tersedia
  let whereCondition = {};

  // Filter berdasarkan type (all atau noread)
  if (type === 'noread') {
    whereCondition.is_read = 0;
  }
  // Jika bukan superadmin, tambahkan filter user_id
  if (user.role !== 'superadmin') {
    whereCondition.user_id = user.id;
  }

  // Hitung total notifikasi yang cocok
  const total = await NotificationModel.count({ where: whereCondition });
  totalall = await NotificationModel.count();

  if (user.role !== 'superadmin') {
    totalall = await NotificationModel.count({ where: {user_id:user.id} });
  }

  // Ambil notifikasi dengan pagination
  const notification = await NotificationModel.findAll({
    where: whereCondition,
    include: {
      model: userModel,
      as: 'user',
      attributes: ['id', 'name', 'username']
    },
    offset,
    limit,
    order: [['created_at', 'DESC']]
  });

  // Hitung posisi prev & next
  const prev = offset - limit >= 0 ? offset - limit : null;
  const next = offset + limit < total ? offset + limit : null;

  const dataRender = {
    ...res.locals,
    notification,
    totalall,
    offset,
    type,
    pagination: {
      total,
      prev,
      next,
      current: offset
    }
  };

  // Render konten body dari partial
  const body = await ejs.renderFile(
    path.join(__dirname, '../views/pages/notification/display.ejs'),
    dataRender
  );

  res.render('app', {
    title: 'Notifikasi',
    body: body,
    controllers: 'js/controllers/notification.js'
  });
};





/**
 * Ambil detail notifikasi dan tandai sebagai sudah dibaca jika milik user
 * @param {*} req 
 * @param {*} res 
 */
exports.getDetail = async (req, res) => {
  const id = req.params.id;

  const notification = await NotificationModel.findOne({
    where: { id },
    include: {
      model: userModel,
      as: 'user',
      attributes: ['id', 'name', 'username']
    }
  });

  if (!notification) {
    return res.status(404).json({ error: 'Notifikasi tidak ditemukan.' });
  }
  let minus = false;
  // Cek apakah user yang login adalah pemilik notifikasi
  if (notification.user_id === req.session.user.id) {
    if (notification.is_read == 0) {
      await notification.update({ is_read: 1 });
      minus = true;
    }
  }

  return res.json({
    minus: minus,
    notification :notification
  });
};

