const ejs = require('ejs');
const path = require('path');
const bcrypt = require('bcrypt');
const { userModel } = require('./../../databases/models');
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.login = async (req, res) => {
  const dataRender = { ...res.locals };

  // Render halaman konten
  const body = await ejs.renderFile(
    path.join(__dirname, '../../views/pages/auth/login.ejs'),
    dataRender
  );

  // Render layout utama (views/index.ejs)
  res.render('layouts/login', {
    title: 'Login',
    body: body,
    controllers: 'js/controllers/login.js'
  });
};
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.loginPost = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await userModel.findOne({ where: { username: username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      req.flash('old', JSON.stringify({
        username: username
      }));
      req.flash('error', JSON.stringify({
        validation: {
          inisial: 'Inisial login tidak diketahui!'
        }
      }));
      return res.redirect('/auth/login');
    }

    // Sukses login
    req.session.user = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role
    };

    return res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Terjadi kesalahan pada server.');
    return res.redirect('/auth/login');
  }
};
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Gagal logout:', err);
      req.flash('error', 'Gagal logout. Silakan coba lagi.');
      return res.redirect('/dashboard');
    }

    // Hapus cookie sesi (opsional, tapi disarankan)
    res.clearCookie('connect.sid');

    console.log("Sesi berhasil dihapus:", req.sessionID);
    return res.redirect('/auth/login');
  });
};
