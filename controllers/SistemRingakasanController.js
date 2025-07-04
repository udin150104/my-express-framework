const ejs = require('ejs');
const fs = require('fs');
const os = require('os');
const path = require('path');
const glob = require('glob'); // pastikan glob sudah di-install
const { userModel, UserLogModel  } = require('../databases/models');
const expressPkg = require('express/package.json');

const DB_PATH = path.join(__dirname, '../databases/database.db');
const BACKUP_DIR = path.join(__dirname, '../databases/backups');
const packageJson = require(path.join(__dirname, '../package.json'));

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.index = async (req, res) => {

  const totalUsers = await userModel.count();

  let sistemInfo = {
      appVersion: packageJson.version,
      totalUsers,
      expressVersion: expressPkg.version,
      os: `${os.type()} ${os.platform()} ${os.release()}`,
      nodeVersion: process.version,
      dbPath: DB_PATH
    }

  const dataRender = {
    ...res.locals,
    sistemInfo
  };

  // Render konten body dari partial
  const body = await ejs.renderFile(
    path.join(__dirname, '../views/pages/sistem/ringkasan.ejs'),
    dataRender
  );

  res.render('app', {
    title: 'Sistem Ringkasan',
    body: body,
    controllers: 'js/controllers/sistem/ringkasan.js'
  });
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.resetLog = async (req, res) => {
  try {
    await UserLogModel.destroy({ where: {}, truncate: true });
    req.flash('success', JSON.stringify({ message: 'Restore berhasil' }));
    return res.redirect('/sistem/ringkasan');
  } catch (err) {
    // console.error('Restore error:', err);
    req.flash('error', JSON.stringify({ message: 'Restore gagal: ' + err.message }));
    return res.redirect('/sistem/ringkasan');
  }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.backup = async (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.db`);

  // 1. Hapus semua file backup sebelumnya
  try {
    const oldBackups = glob.sync(path.join(BACKUP_DIR, 'backup-*.db'));
    oldBackups.forEach(file => {
      try {
        fs.unlinkSync(file);
      } catch (err) {
        console.warn('Gagal menghapus backup lama:', file, err.message);
      }
    });
  } catch (err) {
    console.error('Gagal mencari file backup lama:', err.message);
  }

  // 2. Copy file DB ke backup
  fs.copyFile(DB_PATH, backupFile, (err) => {
    if (err) return res.status(500).send('Gagal membuat backup');

    // 3. Kirim file ke user, lalu hapus setelah dikirim
    res.download(backupFile, (err) => {
      if (err) {
        console.error('Gagal mengirim file:', err);
      }

      // fs.unlink(backupFile, (err) => {
      //   if (err) {
      //     console.error('Gagal menghapus file backup:', err);
      //   }
      // });
    });
  });
};


/**
 * 
 * @param {*} req 
 * @param {*} res 
 */

exports.restore = async (req, res) => {
  if (!req.file) {
    req.flash('error', JSON.stringify({ message: 'File tidak ditemukan.' }));
    return res.redirect('/sistem/ringkasan');
  }

  const uploadedPath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();

  if (ext !== '.db') {
    fs.unlinkSync(uploadedPath);
    req.flash('error', JSON.stringify({ message: 'File harus .db' }));
    return res.redirect('/sistem/ringkasan');
  }

  try {
    // Hapus semua file backup pre-restore sebelumnya
    const oldBackups = glob.sync(path.join(BACKUP_DIR, 'pre-restore-*.db'));
    oldBackups.forEach(file => {
      try {
        fs.unlinkSync(file);
      } catch (err) {
        console.warn('Gagal menghapus backup lama:', file, err.message);
      }
    });

    // Buat backup sebelum restore
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupBefore = path.join(BACKUP_DIR, `pre-restore-${timestamp}.db`);
    fs.copyFileSync(DB_PATH, backupBefore);

    // Ganti database
    fs.copyFileSync(uploadedPath, DB_PATH);

    // Hapus file upload
    fs.unlinkSync(uploadedPath);

    req.flash('success', JSON.stringify({ message: 'Restore berhasil' }));
    return res.redirect('/sistem/ringkasan');
  } catch (err) {
    console.error('Restore error:', err);
    req.flash('error', JSON.stringify({ message: 'Restore gagal: ' + err.message }));
    return res.redirect('/sistem/ringkasan');
  }
};