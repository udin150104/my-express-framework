// middlewares/errorHandler.js
module.exports = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).render('errors/csrf_token'); 
  }
  next(err);
};
