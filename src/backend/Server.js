/* eslint-disable no-unused-vars */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { poolPromise } = require('./dbConfig');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3001;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware kiểm tra authentication
const checkAuth = (req, res, next) => {
    const userCookie = req.cookies.user;
    if (!userCookie) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized - Please login'
        });
    }
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
const upload = multer({ storage: storage });

// Endpoint Để lấy ảnh
// app.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'No file uploaded'
//             });
//         }

//         const avatarPath = `http://localhost:3001/uploads/${req.file.filename}`;
//         const pool = await poolPromise;
//         const email = req.body.email;

//         // Delete the old avatar
//         const TakeDataOldAvt = await pool.request()
//             .input('email', email)
//             .query('SELECT Img_avt FROM users WHERE Email = @email');

//         if (TakeDataOldAvt.recordset.length > 0) {
//             const filePath = path.join(__dirname, 'uploads', TakeDataOldAvt.recordset[0].Img_avt.split('/').pop());
//             if (fs.existsSync(filePath)) {
//                 fs.unlinkSync(filePath);  // Xóa file ảnh cũ
//             }
//         }

//         // Cập nhật thông tin người dùng
//         await pool.request()
//             .input('Avatar', avatarPath)
//             .input('email', email)
//             .query('UPDATE users SET Img_avt = @Avatar WHERE Email = @email');

//         // Lấy thông tin người dùng đã cập nhật
//         const result_query = await pool.request()
//             .input('email', email)
//             .query('SELECT * FROM users WHERE Email = @email');

//         if (result_query.recordset.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'User not found'
//             });
//         }

//         const user = result_query.recordset[0];
//         res.cookie('user', JSON.stringify({
//             name: user.UserName,
//             email: user.Email,
//             Phone: user.Phone,
//             ImgAvt: user.Img_avt,
//         }), {
//             maxAge: 24 * 60 * 60 * 1000, // 24 hours
//             httpOnly: true,
//             secure: true,
//             sameSite: 'strict'
//         });
//         res.send({
//             path: avatarPath,
//         });
//     } catch (error) {
//         console.error('Error uploading avatar:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Error uploading avatar'
//         });
//     }
// });

// API để kiểm tra authentication (GET)
app.get('/check-auth', (req, res) => {
    const userCookie = req.cookies.user;
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
                Phone: userData.Phone,
                ImgAvt: userData.ImgAvt,
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
                message: 'Something was wrong with email or password'
            });
        }

        res.cookie('user', JSON.stringify({
            name: user.UserName,
            email: user.Email,
            Phone: user.Phone,
            ImgAvt: user.Img_avt,
        }), {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.send({
            success: true,
            message: 'Login successful',
            user: {
                name: user.UserName,
                email: user.Email,
                phone: user.Phone,
                img_avt: user.Img_avt,
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
    res.clearCookie('user'); // Xóa cookies khi đăng xuất
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

        if (emailCheck.recordset[0] === email) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Kiểm tra phone đã tồn tại chưa
        const phoneCheck = await pool.request()
            .input('phone', phone)
            .query('SELECT Phone FROM users WHERE Phone = @phone');

        if (phoneCheck.recordset[0] === phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone already exists'
            });
        }

        // Nếu email và phone chưa tồn tại thì thêm user mới
        await pool.request()
            .input('name', name)
            .input('email', email)
            .input('phone', phone)
            .input('password', password)
            .input('terms', terms)
            .query(`
                INSERT INTO users (UserName, Email, Phone, pass_word, terms, Img_avt) 
                VALUES (@name, @email, @phone, @password, @terms, 'https://i.pinimg.com/474x/75/98/a2/7598a2291f7a6c6a220ffb010dd3384e.jpg')
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

//Changes informations user
app.post('/update-informations', upload.single('avatar'), async function(req, res) {
    try {
        const { email, name, phone } = req.body; // Lấy thông tin từ body
        const pool = await poolPromise;
        let newAvatar = '';

        // Kiểm tra xem người dùng có tồn tại không
        const TakeDataOld = await pool.request()
            .input('email', email)
            .query('SELECT * FROM users WHERE Email = @email');

        if (TakeDataOld.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Xóa ảnh cũ nếu có ảnh mới
        if (req.file) {
            const oldAvatarPath = TakeDataOld.recordset[0].Img_avt.split('/').pop();
            const filePath = path.join(__dirname, 'uploads', oldAvatarPath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);  // Xóa file ảnh cũ
            }
            newAvatar = `http://localhost:3001/uploads/${req.file.filename}`;
        } else {
            newAvatar = TakeDataOld.recordset[0].Img_avt; // Giữ nguyên ảnh cũ nếu không có ảnh mới
        }

        // Cập nhật thông tin người dùng
        await pool.request()
            .input('email', email)
            .input('name', name)
            .input('phone', phone)
            .input('avatar', newAvatar)
            .query(`UPDATE users SET UserName=@name, Email=@email, Phone=@phone, Img_avt=@avatar WHERE Email=@email`);

        // Cập nhật cookie
        const userCookie = req.cookies.user;
        if (userCookie) {
            const userData = JSON.parse(userCookie);
            userData.name = name;
            userData.email = email;
            userData.phone = phone;
            userData.ImgAvt = newAvatar; // Cập nhật ảnh mới vào cookie
            res.cookie('user', JSON.stringify(userData), {
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            user: {
                name: name,
                email: email,
                Phone: phone,
                ImgAvt: newAvatar,
            }
        });
    } catch (e) {
        console.error('Error:', e);
        res.status(500).json({
            success: false,
            message: 'Error',
        });
    }
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});