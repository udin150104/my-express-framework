// config/databases.js

const fs = require('fs');
const path = require('path');

// ✅ Tip #2: Pastikan file .env ada sebelum load
const dotenvPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(dotenvPath)) {
  require('dotenv').config({ path: dotenvPath });
} else {
  console.warn('.env file not found at', dotenvPath);
}

// ⬇️ Buat base config
const config = {
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_STORAGE || './databases/database.db',

  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || undefined,
  username: process.env.DB_USER || undefined,
  password: process.env.DB_PASS || undefined,
  database: process.env.DB_NAME || undefined,

  logging: false,
};

// ✅ Hapus field yang tidak diperlukan jika pakai SQLite
if (process.env.DB_DIALECT === 'sqlite') {
  delete config.host;
  delete config.port;
  delete config.username;
  delete config.password;
  delete config.database;
}

// ✅ Tip #1: Export multi environment sekaligus
module.exports = {
  development: config,
  test: {
    ...config,
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  production: config,
};
