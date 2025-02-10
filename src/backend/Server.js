/* eslint-disable no-unused-vars */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { poolPromise } = require('./dbConfig');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3001;
const jwt = require('jsonwebtoken');
const { Login } = require('./Login_SignUp_LogOut/Login');
const { SignUp } = require('./Login_SignUp_LogOut/Sign_up');
const { LogOut } = require('./Login_SignUp_LogOut/Log_out');
const { Update } = require('./updateInformation/update');
const { colleagues } = require('./Team/Colleagues');
const { Invites } = require('./Team/Invites');
const { GetInvites, AcceptInvite } = require('./Team/getInvites');
// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Middleware kiểm tra authentication
const checkAuth = (req, res, next) => {
    const cookies = req.cookies;
    const sessionId = req.headers['x-session-id']; // Lấy sessionId từ header
    const tokenKey = sessionId ? `authToken_${sessionId}` : Object.keys(cookies).find(key => key.startsWith('authToken_'));
    const token = cookies[tokenKey];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, 'SECRET_KEY', (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = decoded;
        next();
    });
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

// API để kiểm tra authentication (GET)
app.get('/check-auth', checkAuth, (req, res) => {
    // console.log(req.user)
    if (!req.user) {
        return res.json({
            success: false,
            message: 'User not authenticated'
        });
    }
    res.json({
        success: true,
        user: req.user
    });
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
app.post('/login', Login);

// API đăng xuất
app.post('/logout', LogOut);

// API để đăng ký user mới (POST)
app.post('/users', SignUp);

//Changes informations user
app.post('/update-informations', upload.single('avatar'), checkAuth, Update);
// ... existing code ...

app.get('/colleagues', colleagues)
app.post('/invites',Invites);
app.get('/InviteGet', GetInvites); 
app.post('/Accept-invite', AcceptInvite);
// ... existing code ...



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});