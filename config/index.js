const database = require('./database')
const token = require('./token')
const nodemailer = require('./nodemailer')
const uploader = require('./uploader')

module.exports = {
    ...database, ...token, ...nodemailer, ...uploader
}