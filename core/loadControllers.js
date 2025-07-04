// core/loadControllers.js
const fs = require('fs');
const path = require('path');

/**
 * 
 * @param {*} baseDir 
 * @returns 
 */
function loadControllers(baseDir = path.join(__dirname, '../controllers')) {
  const controllers = {};

  const walk = (dir, prefix = '') => {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath, `${prefix}${file}/`);
      } else if (file.endsWith('.js')) {
        const key = `${prefix}${file.replace('.js', '')}`;
        try {
          let controller = require(fullPath);

          // Jika pakai export default
          if (controller.default && typeof controller.default === 'object') {
            controller = controller.default;
          }

          if (typeof controller !== 'object') {
            console.warn(`⚠️  Controller "${key}" bukan object. Lewatkan.`);
            return;
          }

          controllers[key] = controller;
        } catch (err) {
          console.error(`❌ Gagal load controller "${key}":`, err.message);
        }
      }
    });
  };

  walk(baseDir);
  return controllers;
}

module.exports = loadControllers;
