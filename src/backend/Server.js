/* eslint-disable no-unused-vars */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { sql, poolPromise } = require('./dbConfig');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { pool } = require('mssql');
const app = express();
const port = 3001;
// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend URL
    medthods: ['GET', 'POST'],
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));
app.use(bodyParser.json());
app.use(cookieParser());

// Middleware kiểm tra authentication
const checkAuth = (req, res, next) => {
    const userCookie = req.cookies.user;
    if (!userCookie) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized - Please login'
        });
    }
    // Parse user data từ cookie
    req.user = JSON.parse(userCookie);
    next();
};
// Cấu hình cho multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage })

// Endpoint Để lấy ảnh
app.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        const avatarPath = `http://localhost:3001/uploads/${req.file.filename}`;
        const email = req.body.email;
        // console.log(email);
        // Save file to SQL Server
        const pool = await poolPromise;
        // Check old files and remove
        const TakeOldFiles = await pool.request()
            .input('Email', email)
            .query('Select * FROM users WHERE Email = @Email')
        if (TakeOldFiles.recordset.length > 0) {
            if (TakeOldFiles.recordset[0].Img_avt != null) {
                const oldFile = TakeOldFiles.recordset[0].Img_avt;
                const TakeOldFileName = oldFile.split('/').pop();
                const FullOldPath = path.join(__dirname, 'uploads', TakeOldFileName)
                fs.unlinkSync(FullOldPath);
            }
        }
        await pool.request()
            .input('Avatar', avatarPath)
            .input('email', email)
            .query('UPDATE users SET Img_avt = @Avatar WHERE Email = @email');

        const result_query = await pool.request()
            .input('email', email)
            .query('SELECT * FROM users WHERE Email = @email');

        if (result_query.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = result_query.recordset[0];
        console.log(user);
        res.cookie('user', JSON.stringify({
            name: user.UserName,
            email: user.Email,
            Phone: user.Phone,
            ImgAvt: avatarPath,
        }), {
            maxAge: 24 * 60 * 60 * 60, // 24hours
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        })
        res.send({
            path: avatarPath,
        })
        app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    } catch (error) {
        console.error('Error uploading avatar:', error);
        return res.status(500).json({
            success: false,
            message: 'Error uploading avatar'
        });
    }
})
// app.get('/upload-avatar', upload.single('avatar'), async(req,res)=>{
//     console.log('Received file:', req.file);
//     if(!req.file){
//         return res.status(400).json({
//             success: false,
//             message: 'No file uploaded'
//         });
//     }
//     const avatarPath = req.file.path;
//     res.json({
//         success: true,
//         message: 'Avatar uploaded successfully',
//         avatarPath: avatarPath
//     })
// })
// Endpoints để hiển thị ảnh người dùng

// API để kiểm tra authentication (GET)
app.get('/check-auth', (req, res) => {
    const userCookie = req.cookies.user;
    // Nếu người dùng đã đăng nhập thì sẽ luôn tồn tại user trong cookies
    if (!userCookie) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }

    try {
        const userData = JSON.parse(userCookie);
        res.send({
            success: true,
            user: {
                name: userData.name,
                email: userData.email,
                ImgAvt: userData.ImgAvt,
                Phone: userData.phone
                //...
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid session'
        });
    }
});


// API để xem danh sách users (GET) - Yêu cầu đăng nhập
app.get('/users', checkAuth, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Users');
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Lỗi:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi khi truy vấn database'
        });
    }
});

// API đăng nhập
app.post('/login', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { email, password } = req.body;

        const result = await pool.request()
            .input('email', email)
            .input('password', password)
            .query('SELECT * FROM Users WHERE Email = @email OR Phone = @email');

        const user = result.recordset[0];
        if (!user || user.pass_word !== password) {
            return res.status(401).json({
                success: false,
                message: 'Sth was wrong with email or password'
            });
        }

        res.cookie('user', JSON.stringify({
            name: user.UserName,
            email: user.Email,
            phone: user.Phone,
            ImgAvt: user.Img_avt,
        }), {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                name: user.UserName,
                email: user.Email,
                ImgAvt: user.Img_avt,
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});


// API đăng xuất
app.post('/logout', (req, res) => {
    res.clearCookie('user'); //  xoá cookies khi đăng xuất
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// API để đăng ký user mới (POST)
app.post('/users', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { name, email, phone, password, "Confirm Password": confirmPass, terms } = req.body;

        // Kiểm tra email đã tồn tại chưa
        const emailCheck = await pool.request()
            .input('email', email)
            .query('SELECT Email FROM users WHERE Email = @email');

        if (emailCheck.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Kiểm tra phone đã tồn tại chưa
        const phoneCheck = await pool.request()
            .input('phone', phone)
            .query('SELECT Phone FROM users WHERE Phone = @phone');

        if (phoneCheck.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Phone number already exists'
            });
        }

        // Nếu email và phone chưa tồn tại thì thêm user mới
        await pool.request()
            .input('name', name)
            .input('email', email)
            .input('phone', phone)
            .input('password', password)
            .input('confirmPass', confirmPass)
            .input('terms', terms)
            .query(`
                INSERT INTO users (UserName, Email, Phone, pass_word, ConfirmPass, terms, Img_avt) 
                VALUES (@name, @email, @phone, @password, @confirmPass, @terms, https://i.pinimg.com/474x/75/98/a2/7598a2291f7a6c6a220ffb010dd3384e.jpg)
            `);

        console.log('User registered successfully');
        res.json({
            success: true,
            message: 'Đăng ký thành công'
        });
    } catch (error) {
        console.error('Chi tiết lỗi:', {
            message: error.message,
            code: error.code,
            state: error.state
        });

        res.status(500).json({
            success: false,
            error: error.message || 'Lỗi khi đăng ký'
        });
    }
});

// API để kiểm tra thông tin người dùng đang đăng nhập (GET)
app.get('/current-user', checkAuth, (req, res) => {
    res.json({
        success: true,
        user: {
            name: req.user.name,
            email: req.user.email,
            ImgAvt: req.user.ImgAvt,
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});