const jwt = require('jsonwebtoken')
module.exports = app => {
  function authenticateToken(req, res, next) {
    const token = req.headers.apikey
    if (token == null)
      return res.send({
        status: false,
        errorMessage: `Unauthorised`,
      })
    let verified = false
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      if (!err) verified = true
    })
    if (!verified)
      return res.send({
        status: false,
        errorMessage: `Unauthorised`,
      })
    const { id, name } = jwt.decode(token)
    req.user = { id, name }
    next()
  }

  const user = require('../Controllers/User.js')

  const router = require('express').Router()
  router.post('/signup', user.create)
  router.post('/', user.login)
  router.post('/refreshToken', user.refreshToken)
  router.post('/logout', user.logout)
  router.get('/info', authenticateToken, user.info)
  app.use('/user', router)
}
