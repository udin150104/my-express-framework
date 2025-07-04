const ejs = require('ejs');
const fs = require('fs').promises;
const path = require('path');
const { UserLogModel, userModel } = require('../databases/models');
const { Op } = require('sequelize');
const parseDataTableQuery = require('./../helpers/datatableParser');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.index = async (req, res) => {

  const dataRender = { ...res.locals };
  // console.log(user);

  // Render halaman konten
  const body = await ejs.renderFile(
    path.join(__dirname, '../views/pages/logactivity.ejs'),
    dataRender
  );

  res.render('app', {
    title: 'Permissions',
    body: body,
    controllers: 'js/controllers/logactivity.js'
    // controllers: ''
  });
};

exports.apiget = async (req, res) => {
  const draw = parseInt(req.query.draw) || 0;
  const start = parseInt(req.query.start) || 0;
  const length = parseInt(req.query.length) || 10;
  const searchValue = req.query['search[value]']?.trim() || '';

  const andConditions = [];

  if (searchValue) {
    andConditions.push({
      [Op.or]: [
        { action: { [Op.like]: `%${searchValue}%` } },
        { description: { [Op.like]: `%${searchValue}%` } },
        { ip_address: { [Op.like]: `%${searchValue}%` } },
        { user_agent: { [Op.like]: `%${searchValue}%` } },
        { '$user.name$': { [Op.like]: `%${searchValue}%` } },
        { '$user.username$': { [Op.like]: `%${searchValue}%` } }
      ]
    });
  }

  const where = andConditions.length > 0 ? { [Op.and]: andConditions } : {};

  const orderColumnIndex = req.query['order[0][column]'];
  const orderDir = req.query['order[0][dir]'] || 'DESC';
  const orderColumn = req.query[`columns[${orderColumnIndex}][data]`] || 'created_at';

  const validColumns = ['user', 'action', 'description', 'ip_address', 'user_agent', 'created_at'];
  const order = validColumns.includes(orderColumn)
    ? (orderColumn === 'user'
        ? [[{ model: userModel, as: 'user' }, 'name', orderDir.toUpperCase()]] // default sort by user.name
        : [[orderColumn, orderDir.toUpperCase()]])
    : [['created_at', 'DESC']];

  try {
    const total = await UserLogModel.count();

    const filtered = await UserLogModel.count({
      where,
      include: {
        model: userModel,
        as: 'user',
        attributes: [],
        required: false
      }
    });

    const data = await UserLogModel.findAll({
      where,
      include: {
        model: userModel,
        as: 'user',
        attributes: ['id', 'name', 'username']
      },
      offset: length === -1 ? undefined : start,
      limit: length === -1 ? undefined : length,
      order,
      subQuery: false
    });

    const resultData = data.map(item => ({
      id: item.id,
      user: item.user ? `${item.user.name} (${item.user.username})` : '-',
      action: parseDataTableQuery(item.action),
      description: item.description,
      ip_address: item.ip_address,
      user_agent: item.user_agent,
      created_at: item.created_at
    }));

    res.json({
      draw,
      recordsTotal: total,
      recordsFiltered: filtered,
      data: resultData
    });
  } catch (error) {
    console.error('Error loading user logs:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
};