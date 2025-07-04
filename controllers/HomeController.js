const ejs = require('ejs');
const path = require('path');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.index = async (req, res) => {
  const dataRender = {
    
  };
  // Render halaman konten
  const body = await ejs.renderFile(
    path.join(__dirname, '../views/pages/home.ejs'),
    dataRender
  );

  // Render layout utama (views/index.ejs)
  res.render('index', {
    title: 'Home',
    body: body,
    controllers: ''
  });
};
