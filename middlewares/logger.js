const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const path = require('path');
const fs = require('fs');

// Pastikan folder logs tersedia
const logDirectory = path.join(__dirname, '../logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// Buat stream log harian
const accessLogStream = rfs.createStream((time, index) => {
  if (!time) time = new Date();
  const day = time.toISOString().slice(0, 10); // format YYYY-MM-DD
  return `access-${day}.log`;
}, {
  interval: '1d',        // rotate per hari
  path: logDirectory
});

// Middleware logger
const logger = morgan('combined', { stream: accessLogStream });

module.exports = logger;
