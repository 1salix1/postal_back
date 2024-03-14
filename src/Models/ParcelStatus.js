const { DataTypes } = require('sequelize')
const moment = require('moment')
module.exports = sequelize => {
  const ParcelStatus = sequelize.define(
    'ParcelStatus',
    {
      description: {
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
  ParcelStatus.associate = function (models) {}
  return ParcelStatus
}
