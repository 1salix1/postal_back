const db = require('../db')
const User = db.User
const UserSession = db.UserSession
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()
const Op = db.Sequelize.Op

const generateAccessToken = user => {
  return jwt.sign({ id: user.id, name: user.name }, process.env.TOKEN_SECRET, { expiresIn: '1h' })
}
const generateRefreshToken = () => {
  return jwt.sign({}, process.env.TOKEN_SECRET, { expiresIn: '30d' })
}
const getPasswordHash = password => {
  const crypto = require('crypto')
  return crypto.pbkdf2Sync(password, process.env.SALT, 1000, 64, `sha512`).toString(`hex`)
}

exports.login = async (req, res) => {
  const login = req.body.login
  const password = req.body.password
  const fingerprint = req.body.fingerprint
  const user = await User.findOne({
    where: {
      login: login,
      password: getPasswordHash(password),
    },
  })
  if (user) {
    let date = new Date()
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    const token = generateAccessToken(user)
    await UserSession.destroy({
      where: {
        expiredIn: { [Op.lte]: date },
      },
    })
    const userSession = await UserSession.findOne({
      where: {
        userId: user.id,
        fingerprint: fingerprint,
        ip: ipAddress,
        expiredIn: { [Op.gt]: date },
      },
    })
    const refreshToken = generateRefreshToken()
    date.setDate(date.getDate() + 30)
    if (userSession) {
      await userSession.update(
        {
          refreshToken: refreshToken,
          expiredIn: date,
        },
        {
          where: {
            id: userSession.id,
          },
        },
      )
    } else {
      await UserSession.create({
        ip: ipAddress,
        fingerprint: fingerprint,
        refreshToken: refreshToken,
        expiredIn: date,
        userId: user.id,
      })
    }

    res.send({
      status: true,
      user: {
        token: token,
        refreshToken: refreshToken,
        name: user.name,
      },
    })
  } else {
    res.send({
      status: false,
      errorMessage: 'Unauthorised',
    })
  }
}
exports.logout = async (req, res) => {
  const fingerprint = req.body.fingerprint
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  await UserSession.destroy({
    where: {
      fingerprint: fingerprint,
      ip: ipAddress,
    },
  })
  res.send({
    status: true,
  })
}
exports.refreshToken = async (req, res) => {
  let date = new Date()
  const refreshToken = req.body.refreshToken
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  const fingerprint = req.body.fingerprint
  const userSession = await UserSession.findOne({
    where: {
      refreshToken: refreshToken,
      fingerprint: fingerprint,
      ip: ipAddress,
      expiredIn: { [Op.gt]: date },
    },
  })
  //const refreshToken = generateRefreshToken()
  console.log(userSession)
  if (userSession) {
    const user = await User.findOne({
      where: {
        id: userSession.userId,
      },
    })
    const newRefreshToken = generateRefreshToken()
    const token = generateAccessToken(user)
    date.setDate(date.getDate() + 30)
    await userSession.update(
      {
        refreshToken: newRefreshToken,
        expiredIn: date,
      },
      {
        where: {
          id: userSession.id,
        },
      },
    )
    res.send({
      status: true,
      token: token,
      refreshToken: refreshToken,
    })
  } else {
    res.send({
      status: false,
      errorMessage: 'Unauthorised',
    })
  }
}
exports.create = async (req, res) => {
  if (!req.body.login || !req.body.password) {
    res.send({
      errorMessage: 'Content can not be empty!',
    })
    return
  }
  const newUser = {
    login: req.body.login,
    password: getPasswordHash(req.body.password),
    name: req.body.name,
    email: req.body.email,
  }

  const user = await User.create(newUser)
  res.send({
    status: true,
    user: user,
  })
}

exports.update = async (req, res) => {
  const id = req.params.id
  const user = await User.findOne({ where: { id: id, password: getPasswordHash(req.body.oldPassword) } })
  if (user) {
    let user_info = {
      name: req.body.name,
      email: req.body.email,
      login: req.body.login,
    }
    if (req.body.password && req.body.password.length > 0) user_info.password = getPasswordHash(req.body.password)

    await user.update(user_info, {
      where: { id: id },
    })
    res.send({
      status: true,
      user: user,
    })
  } else {
    res.send({
      status: false,
      errorMessage: 'Unauthorised',
    })
  }
}

exports.info = async (req, res) => {
  res.send({
    status: true,
    user: {
      name: req.user.name,
    },
  })
}
