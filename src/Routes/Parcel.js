const jwt = require('jsonwebtoken')
const parcel = require('../Controllers/Parcel')
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

module.exports = app => {
  const parcel = require('../Controllers/Parcel')

  const router = require('express').Router()

  router.post('/', authenticateToken, parcel.create)
  router.get('/', authenticateToken, parcel.findAll)
  router.get('/:id', authenticateToken, parcel.findOneById)
  router.get('/track/:trackNumber', parcel.findOneByTrackNumber)
  router.put('/:id', authenticateToken, parcel.update)
  router.post('/:id/status/', authenticateToken, parcel.addStatus)
  router.put('/:parcelId/status/:id', authenticateToken, parcel.updateStatus)
  router.delete('/:parcelId/status/:id', authenticateToken, parcel.deleteStatus)
  router.delete('/:id', authenticateToken, parcel.delete)
  app.use('/parcel', router)
}
