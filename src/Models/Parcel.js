const { DataTypes } = require('sequelize')
const moment = require('moment/moment')
module.exports = sequelize => {
  const Parcel = sequelize.define(
    'Parcel',
    {
      sender: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      receiver: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      trackNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      realTrackNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      addressFrom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      addressTo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        get() {
          return moment(this.getDataValue('createdAt')).format('DD.MM.YYYY H:mm:ss')
        },
      },
    },
    { timestamps: false },
  )
  Parcel.associate = function (models) {
    Parcel.hasMany(models.ParcelStatus, {
      as: 'statuses',
      foreignKey: 'parcelId',
    })
  }
  return Parcel
}
