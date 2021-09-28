const { dbQuery, db, uploader } = require('../config')
const fs = require('fs')

module.exports = {
    addCart: async (req, res, next) => {
        try {
           let addCart = `Insert into cart (iduser, idparcel_type, subtotal) values (${req.user.id}, ${req.body.idparcel_type},${req.body.subtotal});`
           addCart = await dbQuery(addCart)
           let get = `Select * from cart where idcart = ${addCart.insertId}`
           get = await dbQuery(get)
           res.status(200).send(get)
        } catch (error) {
            next(error)
        }
    },

    addToParcel: async (req, res, next) => {
        try {
            let addParcel = `Insert into parcel_detail (idcart, iduser, idparcel_type, idproduct, idcategory, amount, subtotal)
            values (${req.body.idcart}, ${req.user.id}, ${req.body.idparcel_type}, ${req.body.idproduct}, ${req.body.idcategory}, ${req.body.amount}, ${req.body.subtotal});`
            addParcel= await dbQuery(addParcel)
            res.status(200).send({message: `Success!`})
        } catch (error) {
            next(error)
        }
    },

    getCart: async (req, res, next) => {
        try {
            let getCart= `Select c.*, pt.title as title from cart c join parcel_type pt on pt.id = c.idparcel_type where iduser = ${req.user.id}`
            let getDetail = `Select pd.*, p.name, p.price, c.title, p.url from parcel_detail pd join product p on p.id = pd.idproduct join category c on c.id = pd.idcategory;`
            getCart= await dbQuery(getCart)
            getDetail = await dbQuery(getDetail)
            getCart.forEach(item => {
                item.detail = []
                getDetail.forEach(el => {
                    if(item.idcart === el.idcart){
                        item.detail.push(el)
                    }
                })
            })
            res.status(200).send(getCart)
        } catch (error) {
            next(error)
        }
    },

    getCartDetail: async (req, res, next) => {
        try {
            let queryGet = `Select * from parcel_detail where iduser= ${req.user.id};`
            queryGet= await dbQuery(queryGet)
            res.status(200).send(queryGet)
        } catch (error) {
            next(error)
        }
    },

    addTransaction: async (req, res, next) => {
        try {
            // CHECKOUT, ADD TRANSACTION
            let iduser = req.user.id
            let { invoice, idaddress, amount, subtotal_product, subtotal_parcel, ongkir, total_payment, idpayment_status, detail } = req.body
            let addToTrans = `Insert into transaction set ?`
            addToTrans = await dbQuery(addToTrans, { invoice, iduser, amount, idaddress, subtotal_product, subtotal_parcel, ongkir, total_payment, idpayment_status })
            console.log("Checkout Add to transaction Success", addToTrans)

            // ADD TRANSACTION DETAIL
            let addTransDetail = `Insert into transaction_detail (idtransaksi, idparcel_type, idproduct, idcategory, amount) values ?`
            let dataDetail = detail.map(item => [addToTrans.insertId, item.idparcel_type ,item.idproduct, item.idcategory, item.amount])
            addTransDetail = await dbQuery(addTransDetail, [dataDetail])
            console.log("Add detail success", addTransDetail)

            // DELETE CART
            let deleteCart = `Delete from cart where (idcart, iduser) IN (?) ;`
            let deleteCartDetail = `Delete from parcel_detail where (idcart, iduser) IN (?) ;`
            let dataDelete = detail.map(item => [item.idcart, item.iduser])
            deleteCart = await dbQuery(deleteCart, [dataDelete])
            deleteCartDetail = await dbQuery(deleteCartDetail, [dataDelete])
            console.log("Del Success", deleteCart)
            res.status(200).send({ success: true, message: "Checkout Success" })
        } catch (error) {
            next(error)
        }
    },

    getTransaction: async (req, res, next) => {
        try {
            let queryGet = `Select t.*, u.username, a.address, a.phone_number, ps.title from transaction t join user u on u.id = t.iduser 
            join address a on t.idaddress = a.id join payment_status ps on t.idpayment_status=ps.id where t.iduser=${req.user.id};`
            queryGet = await dbQuery(queryGet)
            console.log(queryGet)
            let queryGetDetail = `Select td.*, pt.id as parcel, p.name, p.url, c.title from transaction_detail td join parcel_type pt on pt.id=td.idparcel_type 
            join product p on p.id = td.idproduct join category c on c.id=td.idcategory;`
            queryGetDetail = await dbQuery(queryGetDetail)
            queryGet.forEach(item => {
                item.detail= []
                queryGetDetail.forEach(el => {
                    if(item.id === el.idtransaksi){
                        item.detail.push(el)
                    }
                })
            })
            res.status(200).send(queryGet)
        } catch (error) {
            next(error)
        }
    },

    getPaymentStatus: async (req, res, next) => {
        try {
            let queryGet = `SELECT * FROM payment_status`
            queryGet = await dbQuery(queryGet)
            res.status(200).send(queryGet)
        } catch (error) {
            next(error)
        }
    },

    filterPaymentStatus: async (req, res, next) => {
        try {
            getSQL = `Select t.*, u.username, a.address, a.phone_number, ps.title from transaction t join user u on u.id = t.iduser 
                join address a on t.idaddress = a.id join payment_status ps on t.idpayment_status=ps.id where t.iduser=${req.user.id} and t.idpayment_status=${req.body.idpayment_status};`
            let queryGetDetail = `Select td.*, pt.id as parcel, p.name, p.url, c.title from transaction_detail td join parcel_type pt on pt.id=td.idparcel_type 
            join product p on p.id = td.idproduct join category c on c.id=td.idcategory;`
            getSQL = await dbQuery(getSQL)
            queryGetDetail = await dbQuery(queryGetDetail)
            getSQL.forEach(item => {
                item.detail= []
                queryGetDetail.forEach(el => {
                    if(item.id === el.idtransaksi){
                        item.detail.push(el)
                    }
                })
            })
            res.status(200).send(getSQL)
        } catch (error) {
            next(error)
        }
    },

    uploadPaymentProof: async (req, res, next) => {
        try {
            const upload = uploader('/transaction', 'IMG').fields([{ name: 'images' }])
            upload(req, res, async (error) => {
                try {
                    const { images } = req.files
                    console.log("cek file upload", images)
                    console.log("DATA", JSON.parse(req.body.data))
                    //fugsi add product
                    let iduser = req.user.id
                    let idpayment_status = 5
                    if (iduser) {
                        let data = JSON.parse(req.body.data)
                        let payment = `Update transaction set date_payment=${db.escape(data.date_payment)}, url_payment_image=${db.escape(req.files.images[0].filename)},
                        idpayment_status=${idpayment_status} where id=${data.id};`
                        payment = await dbQuery(payment)
                        res.status(200).send({ message: "Thankyou, We will process your payment" })
                    }
                } catch (err) {
                    // hapus gambar
                    fs.unlinkSync(`./public/transaction/${req.files.images[0].filename}`)
                    console.log(err)
                    next(error)
                }
            })
        } catch (error) {
            next(error)
        }
    },

    updateQtyCart: async (req, res, next) => {
        try {
            console.log("CEK", req.user.id)
            if(req.user.id){
                if (req.body.amount == 0) {
                    let del = `Delete from parcel_detail where idproduct = ${req.body.idproduct} and idcart=${req.body.idcart}`
                    del = await dbQuery(del)
                    res.status(200).send(del)
                } else {
                    let updateSQL = await dbQuery(`Update parcel_detail set amount = ${req.body.amount}, subtotal=${req.body.subtotal} where idproduct = ${req.body.idproduct} and idcart=${req.body.idcart}`)
                    res.status(200).send({ status: "Success", results: updateSQL })
                }
            }
        } catch (error) {
            next(error)
        }
    },

    deleteCart: async (req, res, next) => {
        try {
            if(req.user.id){
                let queryDelCart = `Delete from cart where idcart = ${req.body.idcart};`
                let queryDelCartDetail = `Delete from parcel_detail where idcart = ${req.body.idcart};`
                queryDelCart = await dbQuery(queryDelCart)
                queryDelCartDetail = await dbQuery(queryDelCartDetail)
                res.status(200).send({ status: "Success delete cart"})
            }
        } catch (error) {
            next(error)
        }
    }
}