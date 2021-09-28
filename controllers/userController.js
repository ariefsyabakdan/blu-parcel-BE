const { db, dbQuery, transporter, createToken } = require('../config')

module.exports = {
    register: async (req, res, next) => {
        try {
            if (req.body.email.includes('@') && req.body.username.length >= 6 && req.body.password.length >= 6 && req.body.password.match(/[a-z]/ig) && req.body.password.match(/[0-9]/ig)) {
                if (req.body.email.includes('.com') || req.body.email.includes('.co.id')) {
                    // GENERATE OTP
                    let karakter = '0123456789abcdefghijklmnopqrstuvwxyz'
                    let OTP = ''

                    for (let i = 0; i < 6; i++) {
                        OTP += karakter.charAt(Math.floor(Math.random() * karakter.length))
                    }

                    let insertSQL = `Insert into user (username, fullname, email, password, otp) 
                    values (${db.escape(req.body.username)}, ${db.escape(req.body.fullname)}, ${db.escape(req.body.email)}, ${db.escape(req.body.password)}, ${db.escape(OTP)});`
                    let regis = await dbQuery(insertSQL)
                    let getUser = await dbQuery(`Select * from user where id = ${regis.insertId}`)
                    let { id, username, fullname, email, password, idstatus, otp } = getUser[0]
                    //TOKEN
                    let token = createToken({ id, username, fullname, email, password, idstatus, otp })

                    // Membuat Config email
                    // 1. KONTEN EMAIL
                    let mail = {
                        from: 'Admin Blu Parcel <noreply.bluparcel@gmail.com>', //email pengirim sesuai dengan config nodemailer
                        to: email, //email penerima sesuai data Select dari database
                        subject: '[Blu Parcel] Verification Email',
                        html: `<div style="text-align: center">
                        <div height="250px" width="300px">
                        <img src="cid:logo"/>
                        </div>
                        <h1>Hello, ${username}!</h1>
                        <h3 style="color: gray;">Your OTP: <b>${otp}</b></h3>
                        <a href='http://139.162.63.45:3000.com/verification/${token}' style="text-decoration: none; word-break: break-all;">Verification your Email</a></div>`,
                        attachments: [
                            {
                                filename: 'logo.jpg',
                                path: './public/images/logo.jpg',
                                cid: 'logo'
                            }
                        ]
                    }
                    // 2. CONFIG TRANSPORTER
                    await transporter.sendMail(mail)
                    console.log(id, username, fullname, email, password, idstatus, otp)
                    res.status(201).send({ success: true, message: "registration success!" })
                } else {
                    res.status(500).send("Email and Password Invalid")
                }
            } else {
                res.status(500).send("Email and Password Invalid")
            }
        } catch (error) {
            next(error)
        }
    },

    verify: async (req, res, next) => {
        try {
            let update = `Update user set idstatus = '1' where otp = ${db.escape(req.body.otp)};`
            let response = await dbQuery(update)
            if (response.affectedRows > 0) {
                res.status(200).send({ message: "Account has been verified" })
            } else {
                res.status(400).send({ message: "Account failed to verified" })
            }
        } catch (error) {
            next(error)
        }
    },

    login: async (req, res, next) => {
        try {
            if (req.body.username && req.body.password) {
                if (req.body.username.includes("@") || req.body.username.includes(".com") || req.body.username.includes(".co.id")) {
                    let loginSQL = `Select * from user where email = ${db.escape(req.body.username)} and password = ${db.escape(req.body.password)};`
                    loginSQL = await dbQuery(loginSQL)

                    let getUser = await dbQuery(`Select * from user where id = ${loginSQL[0].id}`)
                    let { id, username, fullname, email, password, role, idstatus, otp } = getUser[0]

                    //TOKEN
                    let token = createToken({ id, username, fullname, email, password, role, idstatus, otp })

                    res.status(200).send({ id, username, fullname, email, password, role, idstatus, otp, token })
                } else {
                    let loginSQL = `Select * from user where username = ${db.escape(req.body.username)} and password = ${db.escape(req.body.password)};`
                    loginSQL = await dbQuery(loginSQL)

                    let getUser = await dbQuery(`Select * from user where id = ${loginSQL[0].id}`)
                    let { id, username, fullname, email, password, role, idstatus, otp } = getUser[0]

                    //TOKEN
                    let token = createToken({ id, username, fullname, email, password, role, idstatus, otp })

                    res.status(200).send({ id, username, fullname, email, password, role, idstatus, otp, token })
                }
            }
        } catch (error) {
            next(error)
        }
    },

    keepLogin: async (req, res, next) => {
        try {
            if (req.user.id) {
                let getUser = `Select * from user where id =${db.escape(req.user.id)};`
                getUser = await dbQuery(getUser)
                let { id, username, fullname, email, password, role, idstatus, otp } = getUser[0]
                //TOKEN
                let token = createToken({ id, username, fullname, email, password, role, idstatus, otp })
                res.status(200).send({ id, username, fullname, email, password, role, idstatus, otp, token })
            }
        } catch (error) {
            next(error)
        }
    },

    forgetPass: async (req, res, next) => {
        try {
            let getEmail = `Select * from user where email = ${db.escape(req.body.email)}`
            getEmail = await dbQuery(getEmail)
            if (getEmail[0]) {
                let karakter = '0123456789abcdefghijklmnopqrstuvwxyz'
                let OTP = ''

                for (let i = 0; i < 6; i++) {
                    OTP += karakter.charAt(Math.floor(Math.random() * karakter.length))
                }

                let update = `Update user set password = ${db.escape(req.body.password)}, idstatus= 2, otp = ${db.escape(OTP)} where email = ${db.escape(req.body.email)};`
                update = await dbQuery(update)
                let getupdate = `Select * from user where email = ${db.escape(req.body.email)}`
                getupdate = await dbQuery(getupdate)
                let { id, username, fullname, email, password, role, idstatus, otp } = getupdate[0]
                //TOKEN
                let token = createToken({ id, username, fullname, email, password, role, idstatus, otp })
                let mail = {
                    from: 'Admin Blu Parcel <noreply.bluparcel@gmail.com>', //email pengirim sesuai dengan config nodemailer
                    to: email, //email penerima sesuai data Select dari database
                    subject: '[Blu Parcel] Verification Email',
                    html: `<div style="text-align: center">
                    <div height="250px" width="300px">
                    <img src="cid:logo"/>
                    </div>
                    <h1>Hello, ${username}!</h1>
                    <h3 style="color: gray;">Your OTP: <b>${otp}</b></h3>
                    <a href='http://139.162.63.45:3000.com/verification/${token}' style="text-decoration: none; word-break: break-all;">Verification your Email</a></div>`,
                    attachments: [
                        {
                            filename: 'logo.jpg',
                            path: './public/images/logo.jpg',
                            cid: 'logo'
                        }
                    ]
                }
                // 2. CONFIG TRANSPORTER
                await transporter.sendMail(mail)
                console.log(id, username, fullname, email, password, role, idstatus, otp, token)
                res.status(200).send({ success: true, message: "Your account has been updated!" })
            }
        } catch (error) {
            next(error)
        }
    },

    reverif: async (req, res, next) => {
        try {
            // GENERATE OTP
            let karakter = '0123456789abcdefghijklmnopqrstuvwxyz'
            let OTP = ''

            for (let i = 0; i < 6; i++) {
                OTP += karakter.charAt(Math.floor(Math.random() * karakter.length))
            }

            let getUser = await dbQuery(`Select * from user where username = ${db.escape(req.body.username)} and password = ${db.escape(req.body.password)}`)
            if (getUser[0].idstatus == 2) {
                let update = `Update user set otp = ${db.escape(OTP)} where username = ${db.escape(req.body.username)};`
                update = await dbQuery(update)
                let get2 = await dbQuery(`Select * from user where username = ${db.escape(req.body.username)}`)
                let { id, username, fullname, email, password, role, idstatus, otp } = get2[0]
                // Membuat Token
                let token = createToken({ id, username, fullname, email, password, role, idstatus, otp })
                let mail = {
                    from: 'Admin Blu Parcel <noreply.bluparcel@gmail.com>', //email pengirim sesuai dengan config nodemailer
                    to: email, //email penerima sesuai data Select dari database
                    subject: '[Blu Parcel] Verification Email',
                    html: `<div style="text-align: center">
                    <div height="250px" width="300px">
                    <img src="cid:logo"/>
                    </div>
                    <h1>Hello, ${username}!</h1>
                    <h3 style="color: gray;">Your OTP: <b>${otp}</b></h3>
                    <a href='http://139.162.63.45:3000.com/verification/${token}' style="text-decoration: none; word-break: break-all;">Verification your Email</a></div>`,
                    attachments: [
                        {
                            filename: 'logo.jpg',
                            path: './public/images/logo.jpg',
                            cid: 'logo'
                        }
                    ]
                }
                // 2. CONFIG TRANSPORTER
                await transporter.sendMail(mail)
                console.log(token)
                res.status(200).send("Resend Verification Success")
            }
        } catch (error) {
            next(error)
        }
    },
    //untuk proteksi email di FE
    getUsers: async (req, res, next) => {
        try {
            let getSQL, dataSearch = []
            for (let prop in req.query) {
                dataSearch.push(`${prop} = ${db.escape(req.query[prop])}`)
            }
            console.log(dataSearch.join(' AND '))
            if (dataSearch.length > 0) {
                getSQL = `Select * from user where ${dataSearch.join(' AND ')};`
            } else {
                getSQL = `Select * from user;`
            }
            let get = await dbQuery(getSQL)
            res.status(200).send(get)
        } catch (error) {
            next(error)
        }
    },
}