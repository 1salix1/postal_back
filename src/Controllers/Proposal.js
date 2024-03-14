const db = require('../db')
const Proposal = db.Proposal

exports.create = async (req, res) => {
  const proposal = {
    phone: req.body.phone,
    email: req.body.email,
    comment: req.body.comment,
  }
  try {
    const newProposal = await Proposal.create(proposal)
    res.send(newProposal)
  } catch (err) {
    res.status(500).send({
      errorMessage: err.message || 'Some error occurred while creating the Proposal.',
    })
  }
}

exports.findAll = async (req, res) => {
  let page = req.query.page ? +req.query.page : 1
  let limit = req.query.limit ? +req.query.limit : 10
  if (!Number.isInteger(page)) page = 1
  if (!Number.isInteger(limit)) limit = 10
  const offset = limit * (page - 1)
  try {
    const proposals = await Proposal.findAll({
      limit: limit,
      offset: offset,
      order: [['id', 'DESC']],
    })
    const total = await Proposal.count()
    res.send({
      proposalsList: proposals,
      total: total,
    })
  } catch (err) {
    res.status(500).send({
      errorMessage: err.message || 'Some error occurred while retrieving Proposals.',
    })
  }
}

exports.update = async (req, res) => {
  const id = req.params.id
  let updatedProposal = await Proposal.findByPk(id)
  if (!updatedProposal) {
    res.status(200).send({
      errorMessage: `Proposal with id=${id} Not found`,
    })
    return
  }
  try {
    updatedProposal = await Proposal.update(
      {
        read: true,
      },
      {
        where: { id: id },
        returning: true,
        plain: true,
      },
    )
    res.send(updatedProposal)
  } catch (err) {
    res.status(500).send({
      errorMessage: err.message || 'Some error occurred while updating Proposal.',
    })
  }
}
