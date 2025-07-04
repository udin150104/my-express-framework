const ejs = require('ejs');
const fs = require('fs').promises;
const path = require('path');
const { PermissionUserModel, PermissionRoleModel } = require('../databases/models');
const { Op } = require('sequelize');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.index = async (req, res) => {
  const filePath = path.join(__dirname, './../config/roles.json');
  const jsonData = await fs.readFile(filePath, 'utf8');
  const roles = JSON.parse(jsonData);

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
    set : 'Atur'
  };

  const dataRender = { ...res.locals, roles, permissionTypes, permissionLabels };
  // console.log(user);

  // Render halaman konten
  const body = await ejs.renderFile(
    path.join(__dirname, '../views/pages/permissions/lists.ejs'),
    dataRender
  );

  res.render('app', {
    title: 'Izin Akses',
    body: body,
    controllers: 'js/controllers/permissions/lists.js'
    // controllers: ''
  });
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.apipermissionrole = async (req, res) => {
  const role = req.params.role;
  const data = await PermissionRoleModel.findAll({
    where: { role },
    attributes: ['slug', 'permission']
  });
  res.json(data);
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.saveUpdate = async (req, res) => {
  const { role, permissions } = req.body;

  if (!role || role.trim() === '') {
    req.flash('error', JSON.stringify({ message: 'Peran belum dipilih silahkan pilih peran terlebih dahulu.' }));
    return res.redirect('/pengaturan/permission');
  }

  try {
    // 1. Hapus semua permission milik role tersebut
    await PermissionRoleModel.destroy({ where: { role } });

    // 2. Siapkan data baru
    const inserts = [];

    for (const slug in permissions) {
      const permObj = permissions[slug];
      for (const permName in permObj) {
        inserts.push({
          role: role,
          slug: slug,
          permission: permName
        });
      }
    }

    // 3. Simpan batch
    if (inserts.length > 0) {
      await PermissionRoleModel.bulkCreate(inserts);
    }

    req.flash('success', JSON.stringify({ message: 'Izin Akses berhasil disimpan.' }));
    return res.redirect('/pengaturan/permission');
  } catch (err) {
    console.error(err);
    req.flash('error', JSON.stringify({ message: 'Terjadi kesalahan saat menyimpan data.' }));
    return res.redirect('/pengaturan/permission');
  }
};


/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.saveUpdateUser = async (req, res) => {
  const { permissions, user_id } = req.body;

  if (!permissions) {
    res.redirect(`/pengaturan/users/${user_id}/permission`); 
  }
  if (!user_id) {
    req.flash('error', JSON.stringify({ message: 'User atau permission tidak valid.' }));
    res.redirect(`/pengaturan/users/${user_id}/permission`); 
  }

  try {
    // 1. Hapus semua permission user lama
    await PermissionUserModel.destroy({
      where: { user_id }
    });

    // 2. Siapkan data baru
    const permissionArray = [];

    for (const slug in permissions) {
      for (const perm in permissions[slug]) {
        permissionArray.push({
          user_id,
          slug,
          permission: perm
        });
      }
    }

    // 3. Simpan ke DB
    if (permissionArray.length > 0) {
      await PermissionUserModel.bulkCreate(permissionArray);
    }

    req.flash('success', JSON.stringify({ message: 'Permission user berhasil disimpan.' }));
    res.redirect(`/pengaturan/users/${user_id}/permission`); 
  } catch (error) {
    // console.error(error);
    req.flash('error', JSON.stringify({ message: error }));
    res.redirect(`/pengaturan/users/${user_id}/permission`); 
  }
};