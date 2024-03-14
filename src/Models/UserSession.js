module.exports = (sequelize, DataTypes) => {
  const UserSession = sequelize.define(
    'UserSession',
    {
      ip: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      refreshToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fingerprint: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expiredIn: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {},
  )
  return UserSession
}
