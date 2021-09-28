const { db, dbQuery, uploader } = require('../config')
const fs = require('fs')

module.exports = {
    getManageProduct: async (req, res, next) => {
        try {
            // console.log("getManageProduct", req.user)
            let role = req.user.role
            // console.log(req.query)
            if (role === 'admin') {
                let countRows = `SELECT COUNT(*) as count FROM product`
                let queryReadProduct = `SELECT product.id, name, idcategory, category.title as category, idstatus, status.title as status, stock, price, url FROM product JOIN category ON product.idcategory = category.id JOIN status ON product.idstatus = status.id WHERE idstatus = 3 ORDER BY ${req.query.column} ${req.query.sort} LIMIT ${req.params.limit} OFFSET ${req.params.offset}`
                let totalProducts = await dbQuery(countRows)
                let dataProduct = await dbQuery(queryReadProduct)
                res.status(200).send({ count: totalProducts[0].count, values: dataProduct })
            } else {
                res.status(401).send({ message: "Must be admin" })
            }
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    deleteProduct: async (req, res, next) => {
        try {
            // console.log("deleteProduct")
            let role = req.user.role
            if (role === 'admin') {
                let queryUpdateProduct = `UPDATE product SET idstatus = 4 WHERE id = ${req.params.id}`
                let response = await dbQuery(queryUpdateProduct)
                if (response.affectedRows > 0) {
                    res.status(200).send({ message: "product has been deleted" })
                } else {
                    res.status(500).send({ message: "delete product failed" })
                }
            } else {
                res.status(401).send({ message: "Must be admin" })
            }
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    editManageProduct: async (req, res, next) => {
        const upload = uploader('/images', 'IMG').fields([{ name: 'images' }])
        upload(req, res, async (error) => {
            try {
                let role = req.user.role
                let data = JSON.parse(req.body.data)
                console.log("Data =>", data)
                // console.log("Cek file upload => ", req.files.images[0].filename)
                if (role === 'admin') {
                    let querySelectImage = `SELECT url FROM product WHERE id = ${db.escape(data.id)}`
                    let imgResponse = await dbQuery(querySelectImage)
                    // console.log(imgResponse)
                    if (imgResponse[0].url !== null && fs.existsSync(`./public/images/${imgResponse[0].url}`)) {
                        if (imgResponse[0].url.length > 0) {
                            fs.unlinkSync(`./public/images/${imgResponse[0].url}`)
                        }
                    }
                    // console.log("images try", req.files.images)
                    let urlQuery = ''
                    if (req.files.images !== undefined) {
                        urlQuery = `, url=${db.escape(req.files.images[0].filename)}`
                    }
                    let queryUpdateProduct = `UPDATE product SET name=${db.escape(data.name)}, idcategory=${db.escape(data.idcategory)}, stock=${db.escape(data.stock)}, price=${db.escape(data.price)}${urlQuery} WHERE id=${db.escape(data.id)}`
                    let response = await dbQuery(queryUpdateProduct)
                    if (response.affectedRows > 0) {
                        res.status(200).send({ message: "product has been updated" })
                    } else {
                        res.status(500).send({ message: "update product failed" })
                    }
                } else {
                    res.status(401).send({ message: "Must be admin" })
                }
            } catch (error) {
                // console.log("images catch", req.files.images)
                if (req.files.images !== undefined) {
                    fs.unlinkSync(`./public/images/${req.files.images[0].filename}`)
                }
                console.log(error)
                next(error)
            }
        })
    },
    
    addProduct: async (req, res, next) => {
        try {
            const upload = uploader('/images', 'IMG').fields([{ name: 'images' }])
            upload(req, res, async (error) => {
                try {
                    const { images } = req.files
                    console.log("cek file upload", images)
                    console.log(JSON.parse(req.body.data))
                    //fugsi add product
                    let role = req.user.role
                    let data = JSON.parse(req.body.data)
                    if (role === 'admin') {
                        let addSQL = `Insert into product (name, idcategory, stock, price, url) 
                        values (${db.escape(data.name)}, ${db.escape(data.idcategory)}, 
                        ${db.escape(data.stock)}, ${db.escape(data.price)}, ${db.escape(req.files.images[0].filename)});`
                        addSQL = await dbQuery(addSQL)
                        res.status(200).send({ message: "product has been added" })
                    } else {
                        res.status(401).send({ message: "Must be admin" })
                    }
                } catch (err) {
                    // hapus gambar
                    fs.unlinkSync(`./public/images/${req.files.images[0].filename}`)
                    console.log(err)
                    next(error)
                }
            })
           } catch (error) {
            next(error)
        }
    },
}