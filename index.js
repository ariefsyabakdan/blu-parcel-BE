const express = require('express')
const app = express()
const port = 8031
const cors = require('cors')
const bearerToken = require('express-bearer-token')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config()

const { db } = require('./config/database')
const {
  userRouter,
  profileRouter,
  productManageRouter,
  transactionManageRouter,
  transactionRouter,
  ongkirRouter,
  financialReportRouter,
  productRouter,
  parcelRouter
} = require('./routers')

app.use(cors()) // get data from front-end
app.use(express.json()) // get json body
app.use('/static', express.static(path.join(__dirname, 'public'))) // access static files in public folder
app.use(bearerToken()) // read token 
app.use('/profile', profileRouter)
app.use('/auth', userRouter)
app.use('/product', productRouter)
app.use('/parcel', parcelRouter)
app.use('/product-manage', productManageRouter)
app.use('/transaction-manage', transactionManageRouter)
app.use('/financial-report', financialReportRouter)
app.use('/transaction', transactionRouter)
app.use('/ongkir', ongkirRouter)


app.get('/', (req, res) => {
  res.send('Hello')
})

db.getConnection((error, connection) => {
  if (error) {
    return console.error('Error connecting mysql: ', error.stack)
  }
  console.log(`Connecting to MySQL Server as ID: ${connection.threadId}`)
})

// Error handling 
app.use((error, request, response, next) => {
  console.log("Error", error)
  response.status(500).send({ status: "Error MySQL!", messages: error })
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
