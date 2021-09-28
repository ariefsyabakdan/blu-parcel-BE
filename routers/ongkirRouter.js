const express = require("express");
const { ongkirController } = require("../controllers");
const router = express.Router();

router.get("/getCity", ongkirController.getCity);
router.post("/postCity", ongkirController.postKotaToDatabase);
router.post("/cost", ongkirController.shippingCost);

module.exports = router;
