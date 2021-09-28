const { db, dbQuery } = require('../config')

module.exports = {
    getParcel: async (req, res, next) => {
        try {
            let get = `Select * from parcel_type`
            let getParcelCategory = `Select * from parcel_type_category_qty`
            get = await dbQuery(get)
            getParcelCategory = await dbQuery(getParcelCategory)
            get.forEach(item => {
                item.detail = []
                item.category = []
                getParcelCategory.forEach(el => {
                    if (item.id === el.idparcel_type) {
                        item.detail.push(el)
                        item.category.push(`idcategory=${el.idcategory}`)
                    }
                })
            })
            res.status(200).send(get)
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    getParcelType: async (req, res, next) => {
        try {
            let getSQL, dataSearch = []
            for (let prop in req.query) {
                dataSearch.push(`${db.escape(req.query[prop])}`)
            }
            console.log(dataSearch.join(' AND '))
            if (dataSearch.length > 0) {
                getSQL = `Select pt.*, p.price from parcel_type_category_qty pt join parcel_type p on p.id = pt.idparcel_type where idparcel_type in (${dataSearch});`
            } else {
                getSQL = `Select pt.*, p.price from parcel_type_category_qty pt join parcel_type p on p.id = pt.idparcel_type;`
            }
            let get = await dbQuery(getSQL)
            res.status(200).send(get)
        } catch (error) {
            next(error)
        }
    },

    filterParcelCategory: async (req, res, next) => {
        try {
            let dataSearch = [], getDetail
            for (let prop in req.query) {
                dataSearch.push(`${db.escape(req.query[prop])}`)
            }
            console.log(dataSearch.join(' AND '))
            let get = `Select * from parcel_type;`
            getDetail = `Select * from parcel_type_category_qty where idcategory in (${dataSearch.join(' , ')});`
            get = await dbQuery(get)
            getDetail = await dbQuery(getDetail)
            get.forEach(item => {
                item.detail = []
                item.category = []
                getDetail.forEach(el => {
                    if (item.id === el.idparcel_type) {
                        item.detail.push(el)
                        item.category.push(`idcategory=${el.idcategory}`)
                    }
                })
            })
            let filter = get.filter(el => el.detail.length !== 0)
            res.status(200).send(filter)
        } catch (error) {
            next(error)
        }
    },
}