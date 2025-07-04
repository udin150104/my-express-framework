'use strict';
module.exports = (sequelize, DataTypes) => {
  const PermissionRoleModel = sequelize.define('PermissionRoleModel', {
    slug: DataTypes.STRING,
    permission: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    underscored: true,
    tableName: 'permission_roles'
  });

  return PermissionRoleModel;
};
