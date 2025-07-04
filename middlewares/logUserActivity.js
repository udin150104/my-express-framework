// middlewares/logUserActivity.js
const { UserLogModel } = require('./../databases/models');

function logUserActivity(action, description = '') {
  return async (req, res, next) => {
    try {
      await UserLogModel.create({
        user_id: req.session?.user?.id || null,
        action,
        description,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        created_at: new Date()
      });
    } catch (err) {
      console.error('Gagal menyimpan log aktivitas:', err.message);
    }

    next();
  };
}

module.exports = logUserActivity;
