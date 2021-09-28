const router = require('express').Router()
const { transactionManageController } = require('../controllers')
const { readToken } = require('../config')

router.get('/:limit/:offset', readToken, transactionManageController.getTransaction)
router.patch('/action/:id', readToken, transactionManageController.transactionAction)

module.exports = router