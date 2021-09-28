const router = require('express').Router()
const { readToken } = require('../config')
const { transactionController } = require('../controllers') 

router.post('/addCart', readToken, transactionController.addCart)
router.post('/addParcel', readToken, transactionController.addToParcel)
router.get('/getcart', readToken, transactionController.getCart)
router.get('/getcart-detail', readToken, transactionController.getCartDetail)
router.post('/checkout', readToken, transactionController.addTransaction)
router.get('/', readToken, transactionController.getTransaction)
router.get('/get-payment-status', transactionController.getPaymentStatus)
router.patch('/filter', readToken, transactionController.filterPaymentStatus)
router.patch('/payment', readToken, transactionController.uploadPaymentProof)
router.patch('/update-qty', readToken, transactionController.updateQtyCart)
router.patch('/del-cart', readToken, transactionController.deleteCart)

module.exports = router