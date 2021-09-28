const path = require('path')
const fs = require('fs')
const { google } = require('googleapis');

// Google setting for upload file

const CLIENT_ID = '65207008876-c6ck0o39r4m8vvktadk1e1ri6kpahsve.apps.googleusercontent.com'
const CLINET_SECRET = 'Atsa5uMYX02Tl6bjC8oJV7Ir'
const REDIRECT_URI = 'https://developers.google.com/oauthplayground/'

const REFRESH_TOKEN =
    '1//04oU6cS1Q_W0LCgYIARAAGAQSNwF-L9IrGZY41O5HgdO83tLJGzjau5DMAC_0JQKKfshByKjiHCmHb3qquH84mlQiNPzuw0IiAek'

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLINET_SECRET,
    REDIRECT_URI
)

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
})

const filePath = path.join(__dirname, 'coba.jpg')

const uploadFile = async () => {
    try {
        const response = await drive.files.create({
            requestBody: {
                name: 'trial.jpg',
                mimeType: 'image/jpg'
            },
            media: {
                mimeType: 'image/jpg',
                body: fs.createReadStream(filePath)
            }
        })
        console.log(response.data)
    } catch (error) {
        console.log(error)
    }
}

// uploadFile()