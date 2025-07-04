const ejs = require('ejs');
const path = require('path');
const { userModel, profileModel } = require('../databases/models');
const bcrypt = require('bcrypt');
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.edit = async (req, res) => {

  const userId = req.session.user.id;
  const user = await userModel.findByPk(userId, {
    include: {
      model: profileModel,
      as: 'profile'
    }
  });

  const dataRender = { ...res.locals, user };
  // console.log(user);

  // Render halaman konten
  const body = await ejs.renderFile(
    path.join(__dirname, '../views/pages/profile.ejs'),
    dataRender
  );

  res.render('app', {
    title: 'Profile',
    body: body,
    controllers: 'js/controllers/profile.js'
  });
};

/**
 * 
 * @param {*} data 
 * @returns 
 */
function validateProfileInput(data) {
  const { name, username, password, password_confirm, gender } = data;

  let errors = {};
  let old = { name, username, gender };
  let isValid = true;

  if (!name || name.trim() === '') {
    errors.name = 'Nama tidak boleh kosong!';
    isValid = false;
  }

  if (!username || username.trim() === '') {
    errors.username = 'Username tidak boleh kosong.';
    isValid = false;
  }

  if (password && password.length < 6) {
    errors.password = 'Kata Sandi minimal 6 karakter.';
    isValid = false;
  }

  if (password && password !== password_confirm) {
    errors.password_confirm = 'Konfirmasi Kata Sandi tidak cocok';
    isValid = false;
  }

  if (!gender || !['L', 'P'].includes(gender)) {
    errors.gender = 'Jenis kelamin tidak valid.';
    isValid = false;
  }

  return { isValid, errors, old };
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.update = async (req, res) => {
  const { name, username, password, password_confirm, gender, birth_date, phone } = req.body;
  const userId = req.session.user.id;

  const { isValid, errors, old } = validateProfileInput(req.body);

  if (!isValid) {
    req.flash('error', JSON.stringify({ validation: errors }));
    req.flash('old', JSON.stringify(old));
    return res.redirect('/profile/edit?error=1');
  }

  try {
    const userUpdate = { name, username };
    if (password) userUpdate.password = await bcrypt.hash(password, 10);

    await userModel.update(userUpdate, { where: { id: userId } });

    const profileData = { gender, birth_date, phone };
    const profile = await profileModel.findOne({ where: { user_id: userId } });

    if (profile) {
      await profile.update(profileData);
    } else {
      await profileModel.create({ ...profileData, user_id: userId });
    }

    req.flash('success', JSON.stringify({ message: 'Profil berhasil diperbarui.' }));
    return res.redirect('/profile/edit');
  } catch (err) {
    req.flash('error', JSON.stringify({ message: 'Terjadi kesalahan pada server.' }));
    return res.redirect('/profile/edit');
  }
};