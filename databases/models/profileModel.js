'use strict';
module.exports = (sequelize, DataTypes) => {
  const profileModel = sequelize.define('profileModel', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    birth_date: DataTypes.DATEONLY,
    gender: DataTypes.STRING,
    phone: DataTypes.STRING,
    jabatan: DataTypes.STRING
  }, {
    tableName: 'profiles'
  });

  profileModel.associate = (models) => {
    profileModel.belongsTo(models.userModel, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return profileModel;
};
