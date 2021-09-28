const { db, dbQuery, uploader } = require('../config')
const fs = require('fs')

module.exports = {
    getProfile: async (req, res, next) => {
        try {
            let auth = req.user.id
            if (auth) {
                let queryReadProfile = `SELECT id, username, fullname, gender, email, date_birth, role, idstatus, url_photo FROM user WHERE user.id = ${auth}`
                let queryReadAddress = `SELECT id, label, recipient_name, phone_number, address.idcity, city.city AS city, postal_code, address FROM address JOIN city ON address.idcity = city.idcity WHERE iduser = ${auth}`
                let dataProfile = await dbQuery(queryReadProfile)
                let dataAddress = await dbQuery(queryReadAddress)
                dataProfile[0].address = dataAddress
                res.status(200).send(dataProfile)
            } else {
                res.status(500).send('must login!')
            }
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    updateProfile: async (req, res, next) => {
        try {
            // console.log("Update Profile", req.body)
            let auth = req.user.id
            if (auth) {
                let value = []
                for (property in req.body) {
                    value.push(`${property} = ${db.escape(req.body[property])}`)
                }
                let queryUpdateProfile = `UPDATE user SET ${value.join(', ')} WHERE id = ${auth}`
                let response = await dbQuery(queryUpdateProfile)
                if (response.affectedRows > 0) {
                    res.status(200).send({message: "profile has been updated"})
                } else {
                    res.status(500).send({message: "update profile failed"})
                }
            } else {
                res.status(401).send('must login!')
            }
        } catch (error) {
            next(error)
        }
    }, 

    addAddress: async (req, res, next) => {
        try {
            // console.log("Add Address")
            let auth = req.user.id
            // let auth = 2
            if (auth) {
                let queryInsertAddress = `INSERT INTO address (iduser, label, recipient_name, phone_number, idcity, postal_code, address) VALUES (${auth}, ${db.escape(req.body.label)}, ${db.escape(req.body.recipient_name)}, ${db.escape(req.body.phone_number)}, ${db.escape(req.body.idcity)}, ${db.escape(req.body.postal_code)}, ${db.escape(req.body.address)})`
                let response = await dbQuery(queryInsertAddress)
                if (response.affectedRows > 0) {
                    res.status(200).send({message: "address has been added"})
                } else {
                    res.status(500).send({message: "adding address failed"})
                }
            } else {
                res.status(401).send('must login!')
            }
        } catch (error) {
            next(error)
        }
    },

    updateAddress: async (req, res, next) => {
        try {
            // console.log("Update Address", req.body)
            let auth = req.user.id
            // let auth = 2
            if (auth) {
                let value = []
                for (property in req.body) {
                    value.push(`${property} = ${db.escape(req.body[property])}`)
                }
                let queryUpdateAddress = `UPDATE address SET ${value.join(', ')} WHERE id = ${req.body.id}`
                let response = await dbQuery(queryUpdateAddress)
                if (response.affectedRows > 0) {
                    res.status(200).send({message: "address has been updated"})
                } else {
                    res.status(500).send({message: "update address failed"})
                }
            } else {
                res.status(401).send('must login!')
            }
        } catch (error) {
            next(error)
        }
    },

    deleteAddress: async (req, res, next) => {
        try {
            let auth = req.user.id
            let id = req.params.id
            if (auth) {
                let queryDeleteAddress = `DELETE FROM address WHERE id = ${id}`
                let response = await dbQuery(queryDeleteAddress)
                if (response.affectedRows > 0) {
                    res.status(200).send({message: "address has been deleted"})
                } else {
                    res.status(500).send({message: "delete address failed"})
                }
            } else {
                res.status(401).send('must login!')
            }
        } catch (error) {
            next(error)
        }
    },

    updatePassword: async (req, res, next) => {
        try {
            let auth = req.user.id
            let querySelectPassword = `SELECT password FROM user WHERE id = ${auth}`
            let data = await dbQuery(querySelectPassword)
            // console.log(req.body, auth)
            // console.log(data[0].password === req.body.password)
            if (auth && data[0].password === req.body.password) {
                let queryUpdateAddress = `UPDATE user SET password = ${db.escape(req.body.confirmPassword)} WHERE id = ${auth}`
                let response = await dbQuery(queryUpdateAddress)
                if (response.affectedRows > 0) {
                    res.status(200).send({message: "password has been updated"})
                } else {
                    res.status(500).send({message: "update password failed"})
                }
            } else {
                res.status(401).send('please check your password')
            }
        } catch (error) {
            next(error)
        }
    },

    updatePhoto: async (req, res, next) => {
        const upload = uploader('/images', 'IMG').fields([{ name: 'images' }])
        upload (req, res, async (error) => {
            try {
                // console.log("Check first req", req.files)
                let auth = req.user.id
                // console.log("cek file upload :", images, req.files.images[0])
                let image = req.files.images[0].filename
                let querySelectImage = `SELECT url_photo FROM user WHERE id = ${auth}`
                let imgResponse = await dbQuery(querySelectImage)
                // console.log(imgResponse)
                if (imgResponse[0].url_photo !== null) {
                    if (imgResponse[0].url_photo.length > 0) {
                        fs.unlinkSync(`./public/images/${imgResponse[0].url_photo}`)
                    }
                }
                let queryUpdateImage = `UPDATE user SET url_photo = ${db.escape(image)} WHERE id = ${auth}`
                let response = await dbQuery(queryUpdateImage)
                if (response.affectedRows > 0) {
                    res.status(200).send({message: "photo has been updated"})
                } else {
                    res.status(500).send({message: "update photo failed"})
                }
            } catch (error) {
                // delete image when upload process error
                fs.unlinkSync(`./public/images/${req.files.images[0].filename}`)
                // error catch from query
                console.log(error)
                // error from upload function
                next(err)
            }
        })
    },

    getListCity: async (req, res, next) => {
        try {
            let auth = req.user.id
            if (auth) {
                let queryReadCity = `SELECT * FROM city`
                let dataCity = await dbQuery(queryReadCity)
                res.status(200).send(dataCity)
            } else {
                res.status(500).send('must login!')
            }
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}