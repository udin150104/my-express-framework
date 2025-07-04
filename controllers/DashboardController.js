const ejs = require('ejs');
const path = require('path');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.index = async (req, res) => {
  const dataRender = { ...res.locals };

  // Render halaman konten
  const body = await ejs.renderFile(
    path.join(__dirname, '../views/pages/dashboard.ejs'),
    dataRender
  );

  // Render layout utama (views/index.ejs)
  res.render('app', {
    title: 'Dashboard',
    body: body,
    controllers: ''
  });
};
