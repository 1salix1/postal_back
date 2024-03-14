const db = require('../db')
const Parcel = db.Parcel
const ParcelStatus = db.ParcelStatus
const parcelValidate = parcel => {
  if (!parcel.sender) {
    return 'Please enter Sender Name'
  }
  if (!parcel.receiver) {
    return 'Please enter Receiver Name'
  }
  if (!parcel.addressFrom) {
    return 'Please enter Sender Address'
  }
  if (!parcel.addressTo) {
    return 'Please enter Receiver Address'
  }
  return true
}

const generateTrackNumberPart = () => {
  let result = ''
  const characters = 'ASCDEFGHIJKLMNOPQRSTUVWXYZ'
  const charactersLength = characters.length
  let counter = 0
  while (counter < 3) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}

exports.create = async (req, res) => {
  try {
    if (!req.body) {
      throw 'Content can not be empty!'
    }
    let valid = parcelValidate(req.body)
    if (valid !== true) {
      throw valid
    }
    let trackNumber = Date.now().toString()
    trackNumber = generateTrackNumberPart() + trackNumber.substring(trackNumber.length - 8) + generateTrackNumberPart()
    const data = {
      userId: req.userId,
      sender: req.body.sender,
      receiver: req.body.receiver,
      type: req.body.type || 1,
      trackNumber: trackNumber,
      realTrackNumber: req.body.realTrackNumber || '',
      addressFrom: req.body.addressFrom,
      addressTo: req.body.addressTo,
      createdAt: new Date(Date.parse(req.body.createdAt)),
    }

    const newParcel = await Parcel.create(data)
    const status = {
      parcelId: newParcel.id,
      description: 'Parcel created',
      createdAt: new Date(Date.parse(req.body.createdAt)),
    }
    await ParcelStatus.create(status)
    const parcel = await Parcel.findByPk(newParcel.id, {
      include: [{ model: db.ParcelStatus, as: 'statuses' }],
      order: [[{ model: db.ParcelStatus, as: 'statuses' }, 'createdAt', 'DESC']],
    })
    res.send({
      status: true,
      parcel: parcel,
    })
  } catch (err) {
    res.send({
      status: false,
      errorMessage: err,
    })
  }
}

exports.findAll = async (req, res) => {
  let page = req.query?.page ? +req.query.page : 1
  let limit = req.query.limit ? +req.query.limit : 10
  if (!Number.isInteger(page)) page = 0
  if (!Number.isInteger(limit)) limit = 10
  const offset = limit * (page - 1)
  try {
    const parcels = await Parcel.findAll({
      limit: limit,
      offset: offset,
      include: [{ model: db.ParcelStatus, as: 'statuses' }],
      order: [
        ['id', 'DESC'],
        [{ model: db.ParcelStatus, as: 'statuses' }, 'createdAt', 'DESC'],
      ],
    })
    const total = await Parcel.count()
    res.send({
      status: true,
      parcels: parcels,
      total: total,
    })
  } catch (err) {
    res.send({
      status: false,
      errorMessage: 'Some error occurred while retrieving Parcels.',
    })
  }
}

exports.findOneById = async (req, res) => {
  try {
    if (!req.params?.id) {
      throw 'empty parcelId'
    }

    const parcel = await Parcel.findByPk(req.params?.id, {
      include: [{ model: db.ParcelStatus, as: 'statuses' }],
      order: [[{ model: db.ParcelStatus, as: 'statuses' }, 'createdAt', 'DESC']],
    })
    if (!parcel) {
      throw `Parcel with id=${id} Not found`
    }
    res.send({
      status: true,
      parcel: parcel,
    })
  } catch (err) {
    res.send({
      status: false,
      errorMessage: err,
    })
  }
}

exports.findOneByTrackNumber = async (req, res) => {
  try {
    if (!req.params?.trackNumber) {
      throw 'empty trackNumber'
    }

    const parcel = await Parcel.findOne({
      include: [{ model: db.ParcelStatus, as: 'statuses' }],
      order: [[{ model: db.ParcelStatus, as: 'statuses' }, 'createdAt', 'DESC']],
      where: { trackNumber: req.params.trackNumber },
    })
    if (!parcel) {
      throw `Parcel with trackNumber=${req.params.trackNumber} Not found`
    }
    res.send({
      status: true,
      parcel: parcel,
    })
  } catch (err) {
    res.send({
      status: false,
      errorMessage: err,
    })
  }
}

exports.update = async (req, res) => {
  const id = req.params.id
  try {
    let valid = parcelValidate(req.body)
    if (valid !== true) {
      throw valid
    }
    let updatedParcel = await Parcel.findByPk(id)
    if (!updatedParcel) {
      throw `Parcel with id=${id} Not found`
    }

    updatedParcel = await Parcel.update(
      {
        sender: req.body.sender,
        receiver: req.body.receiver,
        type: req.body.type || 1,
        realTrackNumber: req.body.realTrackNumber || '',
        addressFrom: req.body.addressFrom,
        addressTo: req.body.addressTo,
      },
      {
        where: { id: id },
      },
    )
    updatedParcel = await Parcel.findByPk(req.params?.id, {
      include: [{ model: db.ParcelStatus, as: 'statuses' }],
      order: [[{ model: db.ParcelStatus, as: 'statuses' }, 'createdAt', 'DESC']],
    })
    res.send({
      status: true,
      parcel: updatedParcel,
    })
  } catch (err) {
    res.send({
      status: false,
      errorMessage: err,
    })
  }
}

exports.addStatus = async (req, res) => {
  const parcelId = req.params.id
  try {
    let parcel = await Parcel.findByPk(parcelId)
    if (!parcel) {
      res.status(200).send({
        errorMessage: `Parcel with id=${parcelId} Not found`,
      })
      return
    }

    const newStats = await ParcelStatus.create({
      description: req.body.description,
      parcelId: parcelId,
      createdAt: new Date(Date.parse(req.body.createdAt)),
    })

    res.send({
      status: true,
      parcelStatus: newStats,
    })
  } catch (err) {
    res.send({
      status: false,
      errorMessage: err,
    })
  }
}

exports.updateStatus = async (req, res) => {
  const id = req.params.id
  const parcelId = req.params.parcelId
  try {
    let parcel = await Parcel.findByPk(parcelId)
    if (!parcel) {
      res.status(200).send({
        errorMessage: `Parcel with id=${parcelId} Not found`,
      })
      return
    }

    const updatesStatus = await ParcelStatus.update(
      {
        description: req.body.description,
      },
      {
        where: { id },
      },
    )

    res.send({
      status: true,
      parcelStatus: updatesStatus,
    })
  } catch (err) {
    res.send({
      status: false,
      errorMessage: err,
    })
  }
}

exports.deleteStatus = async (req, res) => {
  const id = req.params.id
  const parcelId = req.params.parcelId
  try {
    let parcel = await Parcel.findByPk(parcelId)
    if (!parcel) {
      throw `Parcel with id=${parcelId} Not found`
    }

    res.send({
      status: await ParcelStatus.destroy({
        where: { id },
      }),
    })
  } catch (err) {
    res.send({
      status: false,
      errorMessage: err,
    })
  }
}

exports.delete = async (req, res) => {
  try {
    const id = req.params.id

    let parcel = await Parcel.findByPk(id)
    if (!parcel) {
      throw `Parcel with id=${id} Not found`
    }

    res.send({
      status: await Parcel.destroy({
        where: { id: id },
      }),
    })
  } catch (err) {
    res.send({
      status: false,
      errorMessage: err,
    })
  }
}
