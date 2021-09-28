const router = require('express').Router()
const { productController } = require('../controllers')

router.get('/', productController.getProduct)
router.get('/filter-product', productController.filterProductCategory)
// router.get('/product-detail', productController.getProductDetail)
router.patch('/manage-stock/:id', productController.manageStock)

module.exports = router

