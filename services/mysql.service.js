const mysql = require('mysql2/promise');
const mysqlConfig = require('../env/mysqlConfig');

const pool = mysql.createPool(mysqlConfig);

module.exports = pool;