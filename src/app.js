const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const app = express()
const port = 4445
const db = require('./db')
const sequelize = db.sequelize

//sequelize.sync({ force: true })

app.use(cors())
app.use(express.json())
app.listen(port, () => console.log(`App listening on port ${port}!`))

require('./Routes/Proposal')(app)
require('./Routes/User')(app)
require('./Routes/Parcel')(app)
module.exports = app
