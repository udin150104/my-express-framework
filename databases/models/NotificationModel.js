module.exports = (sequelize, DataTypes) => {
  const NotificationModel = sequelize.define('NotificationModel', {
    user_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    message: DataTypes.TEXT,
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    type: DataTypes.STRING,
    link: DataTypes.STRING,
  }, {
    tableName: 'notifications',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  NotificationModel.associate = (models) => {
    NotificationModel.belongsTo(models.userModel, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return NotificationModel;
};
