const Sequelize = require('sequelize')
const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename)
const sequelize = new Sequelize({
    database: 'post',
    dialect: 'postgres',
    username: 'postgres',
    password: 'root',
    dialectOptions: {},
    pool: {
        max: 500,
        min: 0,
        idle: 10000,
    },
})
const db = {}

fs.readdirSync(__dirname+'/Models/')
    .filter((file) => {
        return (
            file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
        )
    })
    .forEach((file) => {
        const model = require(path.join(__dirname+'/Models/', file))(
            sequelize,
            Sequelize.DataTypes
        )
        db[model.name] = model
    })

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db)
    }
})







db.Sequelize = Sequelize
db.sequelize = sequelize


module.exports = db
