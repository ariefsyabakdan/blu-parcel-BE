const { db, dbQuery } = require('../config')

module.exports = {
    getTransaction: async (req, res, next) => {
        try {
            let role = req.user.role 
            // console.log(req.query)
            // http://localhost:8031/transaction-manage/5/0?payment=ongoing,accepted
            if (role === 'admin') {
                let paymentString = []
                let joinQuery = ''
                if (req.query.payment) {
                    req.query.payment.split(",").forEach(element => {
                        paymentString.push(db.escape(element))
                    });
                }
                if (req.query.payment && req.query.from && req.query.to) {
                    joinQuery = `WHERE payment_status.title IN (${paymentString}) AND date_transaction BETWEEN ${db.escape(req.query.from)} AND ${db.escape(req.query.to)}`
                } else if (req.query.from && req.query.to) {
                    joinQuery = `WHERE date_transaction BETWEEN ${db.escape(req.query.from)} AND ${db.escape(req.query.to)}`
                } else if (req.query.payment) {
                    joinQuery = `WHERE payment_status.title IN (${paymentString})`
                }
                let countRows = `SELECT COUNT(*) as count FROM transaction JOIN payment_status ON transaction.idpayment_status = payment_status.id ${joinQuery}`
                let queryReadTransaction = `SELECT transaction.id, invoice, date_transaction, date_payment, username, payment_status.title as payment_status, amount, subtotal_parcel, idpayment_status, url_payment_image FROM transaction JOIN user ON transaction.iduser = user.id JOIN payment_status ON transaction.idpayment_status = payment_status.id ${joinQuery} LIMIT ${req.params.limit} OFFSET ${req.params.offset}`
                // console.log(queryReadTransaction)
                let totalTransaction = await dbQuery(countRows)
                let dataTransaction = await dbQuery(queryReadTransaction)
                res.status(200).send({count: totalTransaction[0].count, values: dataTransaction})
            } else {
                res.status(401).send({message: "Must be admin"})
            }
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    transactionAction: async (req, res, next) => {
        try {
            let role = req.user.role 
            let action = req.query.action
            if (role === 'admin') {
                let idpayment_status =  0
                if (action === 'accept') {
                    idpayment_status = 3
                } else if (action === 'reject') {
                    idpayment_status = 4
                } else {
                    res.status(405).send({ message: "this method not allowed" })
                }
                let updateTransactionStatus = `UPDATE transaction SET idpayment_status = ${idpayment_status} WHERE (id=${req.params.id})`
                let response = await dbQuery(updateTransactionStatus)
                if (response.affectedRows > 0) {
                    res.status(200).send({ message: "transaction updated" })
                } else {
                    res.status(500).send({ message: "failed to update transaction" })
                } 
            } else {
                res.status(401).send({message: "Must be admin"})
            }
        } catch (error) {
            console.log(error)
        }
    }
}