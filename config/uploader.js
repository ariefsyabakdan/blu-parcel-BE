const multer = require('multer')
const fs = require('fs')

module.exports = {
    uploader: (directory, fileNamePrefix) => {
        // default directory
        // console.log("Go to uploader function")
        let defaultDir = './public'

        // diskStorage: saving file in local directory
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const pathDir = directory ? defaultDir + directory : defaultDir
                // console.log("Go to destination function")
                // Check directory in local Back End
                if (fs.existsSync(pathDir)) {
                    // console.log('Directory Exist')
                    cb(null, pathDir)
                }
                else {
                    fs.mkdir(pathDir, {recursive: true}, error => cb(error, pathDir))
                    console.log('Directory Created')
                }
            }, 

            filename: (req, file, cb) => {
                // console.log("Go to filename function")
                let ext = file.originalname.split('.')
                let filename = fileNamePrefix + Date.now() + '.' + ext[ext.length - 1]
                cb(null, filename)
            }
        })

        const fileFilter = (req, file, cb) => {
            // console.log("Go to fileFilter function", file)
            const ext = /\.(jpg|JPG|jpeg|JPEG|png|PNG)/
            if (!file.originalname.match(ext)) {
                return cb(new Error('Your file type are denied'), false)
            }
            cb(null, true)
        }

        return multer({storage, fileFilter})
    }
}