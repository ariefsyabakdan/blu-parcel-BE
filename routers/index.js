const userRouter = require("./userRouter");
const profileRouter = require('./profileRouter')
const productManageRouter = require('./productManageRouter')
const transactionManageRouter = require('./transactionManageRouter')
const transactionRouter = require("./transactionRouter")
const ongkirRouter = require("./ongkirRouter")
const financialReportRouter = require("./financialReportRouter")
const productRouter = require("./productRouter")
const parcelRouter = require("./parcelRouter")

module.exports = {
    userRouter,
    profileRouter,
    productManageRouter,
    transactionManageRouter,
    transactionRouter,
    ongkirRouter,
    financialReportRouter,
    productRouter,
    parcelRouter
}