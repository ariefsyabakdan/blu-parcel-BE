const mysql = require('mysql')
const util = require('util')

const db = mysql.createPool({
    connectionLimit     : 1000,
    connectTimeout      : 60 * 60 * 1000,
    acquireTimeout      : 60 * 60 * 1000,
    timeout             : 60 * 60 * 1000,
    host                : process.env.HOST,
    user                : process.env.USER,
    password            : process.env.PASSWORD,
    database            : process.env.DATABASE,
    port                : process.env.PORT,
    multipleStatements  : true
})

const dbQuery = util.promisify(db.query).bind(db)

module.exports={ db, dbQuery }
