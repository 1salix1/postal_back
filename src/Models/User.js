module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      login: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {},
  )
  User.associate = function (models) {
    User.hasMany(models.Parcel, {
      as: 'parcels',
      foreignKey: 'userId',
    })
    User.hasMany(models.UserSession, {
      as: 'sessions',
      foreignKey: 'userId',
    })
  }
  return User
}
