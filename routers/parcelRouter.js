const router = require('express').Router()
const { parcelController } = require('../controllers')

router.get('/get-parcel', parcelController.getParcel)
router.get('/getParcel-type', parcelController.getParcelType)
router.get(`/filter-parcel`, parcelController.filterParcelCategory)

module.exports = router

