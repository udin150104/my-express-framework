'use strict';
module.exports = (sequelize, DataTypes) => {
  const PermissionUserModel = sequelize.define('PermissionUserModel', {
    slug: DataTypes.STRING,
    permission: DataTypes.STRING,
    user_id: DataTypes.INTEGER
  }, {
    underscored: true,
    tableName: 'permission_users'
  });

  PermissionUserModel.associate = function (models) {
    PermissionUserModel.belongsTo(models.userModel, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return PermissionUserModel;
};
