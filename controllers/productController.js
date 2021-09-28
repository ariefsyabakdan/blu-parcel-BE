const { db, dbQuery } = require('../config')

module.exports = {
    getProduct: async (req, res, next) => {
        try {
            let queryGet = `Select p.*, c.title as category from product p join category c on c.id = p.idcategory where p.idstatus = 3`
            queryGet = await dbQuery(queryGet)
            res.status(200).send(queryGet)
        } catch (error) {
            next(error)
        }
    },
    
    filterProductCategory: async (req, res, next) => {
        try {
            let dataSearch = [], getSQL
            for (let prop in req.query) {
                dataSearch.push(`${db.escape(req.query[prop])}`)
            }
            console.log(dataSearch.join(' AND '))
            if (dataSearch.length > 0) {
                getSQL = `Select p.*, c.title as category from product p join category c on p.idcategory = c.id where idcategory in (${dataSearch.join(' , ')});`
            } else {
                getSQL = `Select  p.*, c.title as category from product p join category c on p.idcategory = c.id;`
            }
            let get = await dbQuery(getSQL)
            res.status(200).send(get)
        } catch (error) {
            next(error)
        }
    },

    manageStock: async (req, res, next) => {
        try {
            let queryUpdate = `Update product set stock = ${req.body.stock} where id = ${req.params.id};`
            queryUpdate = await dbQuery(queryUpdate)
            if (queryUpdate.affectedRows > 0) {
                res.status(200).send({ message: "product has been updated" })
            } else {
                res.status(400).send({ message: "update product failed" })
            }
        } catch (error) {
            next(error)
        }
    },
}
