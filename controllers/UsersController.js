const ejs = require('ejs');
const fs = require('fs').promises;
const path = require('path');
const { userModel, profileModel, PermissionRoleModel, PermissionUserModel } = require('../databases/models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');


/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.permission = async (req, res) => {
  const filePath = path.join(__dirname, './../config/roles.json');
  const jsonData = await fs.readFile(filePath, 'utf8');
  const roles = JSON.parse(jsonData);

  const userId = req.params.id;

  // Dapatkan semua jenis permission unik dari semua menu & children
  const collectPermissions = (menus) => {
    const all = new Set();
    const traverse = (items) => {
      items.forEach(menu => {
        if (menu.permission) menu.permission.forEach(p => all.add(p));
        if (menu.children) traverse(menu.children);
      });
    };
    traverse(menus);
    return Array.from(all); // ['access', 'create', 'delete', 'edit', ...]
  };

  const permissionTypes = collectPermissions(res.locals.menus);
  const permissionLabels = {
    access: 'Akses',
    view: 'Lihat',
    create: 'Tambah',
    edit: 'Ubah',
    delete: 'Hapus',
    setpermission: 'Atur Izin Akses',
    set: 'Atur'
  };

  const user = await userModel.findByPk(userId, {
    include: {
      model: profileModel,
      as: 'profile'
    }
  });
  const role = user.role;
  const rawPermissions = await PermissionRoleModel.findAll({
    where: { role },
    attributes: ['slug', 'permission']
  });

  // Ubah ke bentuk map: { "pengaturan.pengguna:create": true, ... }
  const permissionMap = {};
  rawPermissions.forEach(p => {
    permissionMap[`${p.slug}:${p.permission}`] = true;
  });

  const rawUserPermissions = await PermissionUserModel.findAll({
    where: { user_id: userId }, // user_id dari req.body, req.query, atau params
    attributes: ['slug', 'permission']
  });

  // Ubah ke bentuk map untuk pencocokan cepat
  const userPermissionMap = {};
  rawUserPermissions.forEach(p => {
    userPermissionMap[`${p.slug}:${p.permission}`] = true;
  });

  const dataRender = { ...res.locals, user, roles, permissionTypes, permissionLabels, permissionMap, userPermissionMap };
  // Render halaman konten
  const body = await ejs.renderFile(
    path.join(__dirname, '../views/pages/users/permission.ejs'),
    dataRender
  );

  res.render('app', {
    title: 'Izin Akses User',
    body: body,
    controllers: 'js/controllers/users/permission.js'
    // controllers: ''
  });
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.index = async (req, res) => {
  const filePath = path.join(__dirname, './../config/roles.json');
  const jsonData = await fs.readFile(filePath, 'utf8');
  const roles = JSON.parse(jsonData);

  const userId = req.session.user.id;
  const user = await userModel.findByPk(userId, {
    include: {
      model: profileModel,
      as: 'profile'
    }
  });

  const dataRender = { ...res.locals, user, roles };
  // console.log(user);

  // Render halaman konten
  const body = await ejs.renderFile(
    path.join(__dirname, '../views/pages/users/lists.ejs'),
    dataRender
  );

  res.render('app', {
    title: 'Pengguna',
    body: body,
    controllers: 'js/controllers/users/user.js'
  });
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.create = async (req, res) => {
  const filePath = path.join(__dirname, './../config/roles.json');
  const jsonData = await fs.readFile(filePath, 'utf8');
  const roles = JSON.parse(jsonData);

  const dataRender = { ...res.locals, roles };
  // console.log(dataRender)

  // Render halaman konten
  const body = await ejs.renderFile(
    path.join(__dirname, '../views/pages/users/create.ejs'),
    dataRender
  );

  res.render('app', {
    title: 'Form Pengguna',
    body: body,
    controllers: 'js/controllers/users/form.js'
  });
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.edit = async (req, res) => {

  const filePath = path.join(__dirname, './../config/roles.json');
  const jsonData = await fs.readFile(filePath, 'utf8');
  const roles = JSON.parse(jsonData);

  const userId = req.params.id;

  const user = await userModel.findByPk(userId, {
    include: [
      { model: profileModel, as: 'profile' },
    ]
  });
  const dataRender = { ...res.locals, user, roles };

  // Render halaman konten
  const body = await ejs.renderFile(
    path.join(__dirname, '../views/pages/users/edit.ejs'),
    dataRender
  );

  res.render('app', {
    title: 'Form Pengguna',
    body: body,
    controllers: 'js/controllers/users/form.js'
  });
};


/**
 *
 *
 * @param {*} data
 * @param {*} [id=null]
 * @return {*} 
 */
async function validateProfileInput(data, id = null) {
  const { name, username, password, role, password_confirm } = data;

  let errors = {};
  let isValid = true;

  if (!name || name.trim() === '') {
    errors.name = 'Nama tidak boleh kosong!';
    isValid = false;
  } else {
    // Cek apakah username sudah dipakai user lain
    const existingUser = await userModel.findOne({
      where: {
        username: username.trim(),
        ...(id ? { id: { [Op.ne]: id } } : {}) // jika id diberikan, exclude user itu sendiri
      }
    });

    if (existingUser) {
      errors.username = 'Username sudah digunakan.';
      isValid = false;
    }
  }

  if (!username || username.trim() === '') {
    errors.username = 'Username tidak boleh kosong.';
    isValid = false;
  }

  if (!role || role.trim() === '') {
    errors.role = 'Peran tidak boleh kosong!';
    isValid = false;
  }

  if (id === null) {
    if (!password || password.trim() === '') {
      errors.password = 'Kata Sandi tidak boleh kosong.';
      isValid = false;
    }
  }

  if (password && password.length < 6) {
    errors.password = 'Kata Sandi minimal 6 karakter.';
    isValid = false;
  }

  if (password && password !== password_confirm) {
    errors.password_confirm = 'Konfirmasi Kata Sandi tidak cocok';
    isValid = false;
  }

  return { isValid, errors };
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.save = async (req, res) => {
  const { name, username, password, role, password_confirm, gender, birth_date, phone } = req.body;

  const { isValid, errors } = await validateProfileInput(req.body);

  if (!isValid) {
    req.flash('error', JSON.stringify({ validation: errors }));
    return res.redirect('/pengaturan/users/create?error=1');
  }

  try {
    // Simpan user
    const userData = { name, username, role };
    if (password && password.trim() !== '') {
      userData.password = await bcrypt.hash(password, 10);
    }


    const user = await userModel.create(userData); // ← sesuaikan nama model jika berbeda

    // Simpan profil terkait user
    await profileModel.create({
      user_id: user.id, // ← pastikan ada relasi ke user
      gender,
      birth_date: birth_date || null,
      phone
    });

    // Simpan pesan sukses
    req.flash('success', JSON.stringify({ message: 'Data berhasil disimpan.' }));

    // Redirect sesuai tombol yang ditekan
    if (req.body.action === 'save_back') {
      return res.redirect('/pengaturan/users'); // kembali ke list
    } else {
      return res.redirect('/pengaturan/users/create'); // tetap di form
    }

  } catch (err) {
    console.error(err); // debug log
    req.flash('error', JSON.stringify({ message: 'Terjadi kesalahan pada server.' }));
    return res.redirect('/pengaturan/users');
  }
};
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.update = async (req, res) => {
  const { name, username, password, role, password_confirm, gender, birth_date, phone } = req.body;
  const userId = req.params.id;

  // Jalankan validasi input
  const { isValid, errors } = await validateProfileInput(req.body, userId);

  if (!isValid) {
    req.flash('error', JSON.stringify({ validation: errors }));
    return res.redirect(`/pengaturan/users/${userId}/edit?error=1`);
  }

  try {
    // Ambil data user dari DB
    const user = await userModel.findByPk(userId, {
      include: [{ model: profileModel, as: 'profile' }]
    });

    if (!user) {
      req.flash('error', JSON.stringify({ message: 'User tidak ditemukan.' }));
      return res.redirect('/pengaturan/users');
    }

    // Update data user
    user.name = name;
    user.username = username;
    user.role = role;

    if (password && password.trim() !== '') {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    // Update atau buat profil
    if (user.profile) {
      // Update profil yang sudah ada
      await user.profile.update({
        gender,
        birth_date: birth_date || null,
        phone
      });
    } else {
      // Jika belum ada, buat baru
      await profileModel.create({
        user_id: user.id,
        gender,
        birth_date: birth_date || null,
        phone
      });
    }

    // Sukses
    req.flash('success', JSON.stringify({ message: 'Data berhasil diperbarui.' }));

    // Redirect sesuai tombol
    if (req.body.action === 'save_back') {
      return res.redirect('/pengaturan/users');
    } else {
      return res.redirect(`/pengaturan/users/${userId}/edit`);
    }

  } catch (err) {
    console.error(err);
    req.flash('error', JSON.stringify({ message: 'Terjadi kesalahan pada server.' }));
    return res.redirect(`/pengaturan/users/${userId}/edit`);
  }
};
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.destroy = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await userModel.findByPk(userId, {
      include: [{ model: profileModel, as: 'profile' }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    // Hapus profil terlebih dahulu jika ada
    if (user.profile) {
      await user.profile.destroy();
    }

    // Hapus user
    await user.destroy();

    return res.json({ success: true, message: 'User berhasil dihapus.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.apiget = async (req, res) => {
  const draw = parseInt(req.query.draw) || 0;
  const start = parseInt(req.query.start) || 0;
  const length = parseInt(req.query.length) || 10;
  const searchValue = req.query['search[value]']?.trim() || '';

  const columnFilters = {
    name: req.query['columns[0][search][value]']?.trim() || '',
    username: req.query['columns[1][search][value]']?.trim() || '',
    role: req.query['columns[2][search][value]']?.trim() || ''
  };

  const andConditions = [];

  if (searchValue) {
    andConditions.push({
      [Op.or]: [
        { name: { [Op.like]: `%${searchValue}%` } },
        { username: { [Op.like]: `%${searchValue}%` } },
        { role: { [Op.like]: `%${searchValue}%` } }
      ]
    });
  }

  for (const [field, value] of Object.entries(columnFilters)) {
    if (value) {
      andConditions.push({
        [field]: { [Op.like]: `%${value}%` }
      });
    }
  }

  const where = andConditions.length > 0 ? { [Op.and]: andConditions } : {};

  // 🔽 Menentukan kolom untuk sorting dari DataTables
  const orderColumnIndex = req.query['order[0][column]'];
  const orderDir = req.query['order[0][dir]'] || 'asc';
  const orderColumn = req.query[`columns[${orderColumnIndex}][data]`];

  // Daftar kolom yang diizinkan untuk di-sort
  const validColumns = ['name', 'username', 'role'];
  const order = validColumns.includes(orderColumn)
    ? [[orderColumn, orderDir.toUpperCase()]]
    : [['id', 'DESC']]; // fallback

  try {
    const total = await userModel.count();
    const filtered = await userModel.count({ where });

    const data = await userModel.findAll({
      where,
      offset: length === -1 ? undefined : start,
      limit: length === -1 ? undefined : length,
      order
    });

    res.json({
      draw,
      recordsTotal: total,
      recordsFiltered: filtered,
      data
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
};
