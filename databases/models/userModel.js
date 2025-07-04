'use strict';
module.exports = (sequelize, DataTypes) => {
  const userModel = sequelize.define('userModel', {
    name: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    tableName: 'users'
  });

  userModel.associate = (models) => {
    userModel.hasOne(models.profileModel, {
      foreignKey: 'user_id',
      as: 'profile'
    });
  };

  return userModel;
};
