// models/UserLogModel.js
module.exports = (sequelize, DataTypes) => {
  const UserLogModel = sequelize.define('UserLogModel', {
    user_id: DataTypes.INTEGER,
    action: DataTypes.STRING,
    description: DataTypes.TEXT,
    ip_address: DataTypes.STRING,
    user_agent: DataTypes.TEXT,
    created_at: DataTypes.DATE
  }, {
    tableName: 'user_logs',
    timestamps: false
  });

  UserLogModel.associate = (models) => {
    UserLogModel.belongsTo(models.userModel, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return UserLogModel;
};
