const jwt = require('jsonwebtoken')

module.exports = {
    //Middleware atau method function untuk membuat token
    createToken: (payload) => {
        return jwt.sign(payload, "bluparcel$", {
            expiresIn: '12h'
        })
    },
    readToken: (req, res, next) => {
        // console.log("Cek REQ TOKEN", req.token)
        jwt.verify(req.token, "bluparcel$", (err, decoded) => {
            if (err) {
                return res.status(401).send('User not authorization')
            }

            //data hasil terjemahan token
            req.user = decoded

            next()
        })
    }
}