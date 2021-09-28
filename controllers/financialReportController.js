const { db, dbQuery } = require('../config')

module.exports = {
    getRevenue: async (req, res, next) => {
        try {
            let role = req.user.role 
            if (role === 'admin') {
                let queryRevenue = `SELECT DATE(date_transaction) AS date, SUM(subtotal_parcel - subtotal_product) as profit,
                SUM(subtotal_parcel) as user_spent FROM transaction GROUP BY DATE(date_transaction) ORDER BY date;`
                let queryTopParcelRevenue = `SELECT idparcel_type AS parcel, SUM(parcel_profit) AS profit FROM
                (SELECT idparcel_type, (parcel_type.price - SUM(transaction_detail.amount * product.price)) AS parcel_profit
                FROM transaction JOIN transaction_detail ON transaction.id = transaction_detail.idtransaksi 
                JOIN product ON transaction_detail.idproduct = product.id
                JOIN parcel_type ON parcel_type.id = transaction_detail.idparcel_type
                GROUP BY invoice, idparcel_type) sub 
                GROUP BY idparcel_type ORDER BY profit DESC;`
                if (req.query.from && req.query.to) {
                    queryRevenue = `SELECT DATE(date_transaction) AS date, SUM(subtotal_parcel - subtotal_product) as profit, SUM(subtotal_parcel) as user_spent FROM transaction WHERE date_transaction BETWEEN ${db.escape(req.query.from)} AND ${db.escape(req.query.to)} GROUP BY DATE(date_transaction) ORDER BY date`
                    queryTopParcelRevenue = `SELECT idparcel_type AS parcel, SUM(parcel_profit) AS profit FROM
                (SELECT idparcel_type, (parcel_type.price - SUM(transaction_detail.amount * product.price)) AS parcel_profit
                FROM transaction JOIN transaction_detail ON transaction.id = transaction_detail.idtransaksi 
                JOIN product ON transaction_detail.idproduct = product.id
                JOIN parcel_type ON parcel_type.id = transaction_detail.idparcel_type 
                WHERE date_transaction BETWEEN ${db.escape(req.query.from)} AND ${db.escape(req.query.to)}
                GROUP BY invoice, idparcel_type) sub 
                GROUP BY idparcel_type ORDER BY profit DESC;`
                }
                let queryTotalRevenue = `SELECT SUM(subtotal_parcel - subtotal_product) as total_revenue FROM transaction`
                let queryCurrentMonthRevenue = `SELECT SUM(subtotal_parcel - subtotal_product) as revenue FROM transaction WHERE MONTH(date_transaction)=MONTH(curdate())`
                let queryCurrentDateRevenue = `SELECT SUM(subtotal_parcel - subtotal_product) as revenue FROM transaction WHERE DATE(date_transaction)=curdate()`
                let queryFilteredRevenue = `SELECT SUM(subtotal_parcel - subtotal_product) as revenue FROM transaction WHERE date_transaction BETWEEN ${db.escape(req.query.from)} AND ${db.escape(req.query.to)}`
                let total = await dbQuery(queryTotalRevenue)
                let month = await dbQuery(queryCurrentMonthRevenue)
                let day = await dbQuery(queryCurrentDateRevenue)
                let filtered = await dbQuery(queryFilteredRevenue)
                let data = await dbQuery(queryRevenue)
                let topParcel = await dbQuery(queryTopParcelRevenue)
                res.status(200).send({total: total[0].total_revenue, month: month[0].revenue, day: day[0].revenue, filtered: filtered[0].revenue, data: data, top: topParcel})
            } else {
                res.status(400).send({message: "Must be admin"})
            }
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    getItemReport: async (req, res, next) => {
        try {
            let role = req.user.role 
            if (role === 'admin') {
                let querySalesItem = `SELECT DATE(date_transaction) AS date, SUM(transaction_detail.amount) as amount FROM transaction JOIN transaction_detail ON transaction.id = transaction_detail.idtransaksi GROUP BY DATE(date_transaction) ORDER BY date`
                let querytopCategory = `SELECT title AS category, SUM(transaction_detail.amount) AS total FROM transaction JOIN transaction_detail ON transaction.id = transaction_detail.idtransaksi JOIN category ON idcategory = category.id GROUP BY idcategory ORDER BY total DESC;`
                if (req.query.from && req.query.to) {
                    querySalesItem = `SELECT DATE(date_transaction) AS date, SUM(transaction_detail.amount) as amount FROM transaction JOIN transaction_detail ON transaction.id = transaction_detail.idtransaksi WHERE date_transaction BETWEEN ${db.escape(req.query.from)} AND ${db.escape(req.query.to)} GROUP BY DATE(date_transaction) ORDER BY date`
                    querytopCategory = `SELECT title AS category, SUM(transaction_detail.amount) AS total FROM transaction JOIN transaction_detail ON transaction.id = transaction_detail.idtransaksi JOIN category ON idcategory = category.id WHERE date_transaction BETWEEN ${db.escape(req.query.from)} AND ${db.escape(req.query.to)} GROUP BY idcategory ORDER BY total DESC;`
                }
                let queryTotalItem = `SELECT SUM(transaction_detail.amount) as total_product FROM transaction_detail`
                let queryCurrentMonthItem = `SELECT SUM(transaction_detail.amount) as total_product FROM transaction JOIN transaction_detail ON transaction.id = transaction_detail.idtransaksi WHERE MONTH(date_transaction)=MONTH(curdate())`
                let queryCurrentDateItem = `SELECT SUM(transaction_detail.amount) as total_product FROM transaction JOIN transaction_detail ON transaction.id = transaction_detail.idtransaksi WHERE DATE(date_transaction)=curdate()`
                let queryFilteredItem = `SELECT SUM(transaction_detail.amount) as total_product FROM transaction JOIN transaction_detail ON transaction.id = transaction_detail.idtransaksi WHERE date_transaction BETWEEN ${db.escape(req.query.from)} AND ${db.escape(req.query.to)}`
                let data = await dbQuery(querySalesItem)
                let total = await dbQuery(queryTotalItem)
                let month = await dbQuery(queryCurrentMonthItem)
                let day = await dbQuery(queryCurrentDateItem)
                let filtered = await dbQuery(queryFilteredItem)
                let topCategory = await dbQuery(querytopCategory)
                res.status(200).send({total: total[0].total_product, month: month[0].total_product, day: day[0].total_product, filtered: filtered[0].total_product, data: data, top: topCategory})
            } else {
                res.status(400).send({message: "Must be admin"})
            }
        } catch (error) {
            console.log(error)
            next(error)
        }
    },
}