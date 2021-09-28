const express = require('express')
const router = express.Router()
const { readToken } = require('../config')
const { userController } = require('../controllers')

router.post('/regis', userController.register)
router.patch('/verify', readToken, userController.verify)
router.post('/login', userController.login)
router.post('/keep', readToken, userController.keepLogin)
router.patch('/update-pass', userController.forgetPass)
router.patch('/reverif', userController.reverif)
router.get('/get', userController.getUsers)

module.exports = router