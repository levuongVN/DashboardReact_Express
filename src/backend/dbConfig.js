const sql = require('mssql');
require('dotenv').config(); // lấy từ file .env để biến process.env có thể đọc được file .evn và truy xuất dữ liệu

// Cấu hình kết nối
const config = {
    user: process.env.DB_USER,          // lấy từ .env
    password: process.env.DB_PASSWORD,   // lấy từ .env
    server: process.env.DB_SERVER,       // lấy từ .env
    database: process.env.DB_DATABASE,   // lấy từ .env
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',  // chuyển string thành boolean
        trustServerCertificate: true
    }
};

// Tạo pool connection
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('Database connection failed:', err);
    });

module.exports = {
    sql,
    poolPromise
};
