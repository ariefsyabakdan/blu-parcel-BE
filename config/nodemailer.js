// password 2FA Gmail : weiqcgjpqpbxlglz

const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'noreply.bluparcel@gmail.com',
        pass: 'weiqcgjpqpbxlglz',
    },
    tls: {
        rejectUnauthorized: false
    }
})

module.exports = {transporter}