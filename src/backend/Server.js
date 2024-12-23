const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { sql, poolPromise } = require('./dbConfig');
const app = express();
const port = 3001;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Frontend URL
    credentials: true // Cho phép gửi cookies
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
        res.json({
            success: true,
            user: {
                name: userData.name,
                email: userData.email,
                ImgAvt: userData.ImgAvt,
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
            ImgAvt: user.ImgAvt
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
                ImgAvt: user.ImgAvt
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

// app.get('/login', async (req, res) => {
//     let pool = await poolPromise;
//     const result = await pool.request()
//         .input('email', 'johndoe@example.com')
//         .query('SELECT * FROM Users WHERE Email = @email OR Phone = @email');
    
//     const user = result.recordset[0];
//     // console.log('User data:', user);
//     if (user) {
//         res.json({
//             success: true,
//             user: {
//                 name: user.UserName,
//                 email: user.Email,
//                 ImgAvt: user.ImgAvt
//             }
//         });
//     } else {
//         res.status(404).json({
//             success: false,
//             message: 'User not found'
//         });
//     }
// });

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
                INSERT INTO users (UserName, Email, Phone, pass_word, ConfirmPass, terms) 
                VALUES (@name, @email, @phone, @password, @confirmPass, @terms)
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

// API kiểm tra authentication

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});