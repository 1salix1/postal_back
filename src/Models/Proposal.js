const { DataTypes } = require('sequelize')
module.exports = sequelize => {
  const Proposal = sequelize.define(
    'Proposal',
    {
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      read: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      comment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      validate: {
        checkContacts() {
          if (this.email === null && this.phone === null) {
            throw new Error('Please enter phone or email')
          }
        },
      },
    },
  )

  return Proposal
}
