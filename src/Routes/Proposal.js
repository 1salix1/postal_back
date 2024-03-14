const jwt = require('jsonwebtoken')
const db = require('../db')

const User = db.User
function authenticateToken(req, res, next) {
  const token = req.headers.apikey
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    User.findOne({
      where: {
        token: token,
      },
    })
      .then(data => {
        if (data) {
          req.user = data
          next()
        } else {
          return res.sendStatus(403)
        }
      })
      .catch(() => {
        return res.sendStatus(403)
      })
  })
}

module.exports = app => {
  const proposal = require('../Controllers/Proposal')

  const router = require('express').Router()

  router.post('/', proposal.create)
  router.get('/', authenticateToken, proposal.findAll)
  router.put('/:id', authenticateToken, proposal.update)

  app.use('/proposal', router)
}
