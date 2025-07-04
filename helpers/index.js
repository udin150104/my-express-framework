const fs = require('fs');
const path = require('path');

const helpers = {};
const files = fs.readdirSync(__dirname);

files.forEach(file => {
  const fullPath = path.join(__dirname, file);

  // Lewati file ini sendiri (index.js)
  if (file !== 'index.js' && file.endsWith('.js')) {
    const mod = require(fullPath);
    const name = path.basename(file, '.js');
    helpers[name] = mod;
  }
});

module.exports = helpers;
