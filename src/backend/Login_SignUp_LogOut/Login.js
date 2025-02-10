const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const jwt = require('jsonwebtoken');
const { poolPromise } = require('../dbConfig');
app.use(cookieParser());
exports.Login = async (req, res) => {
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

        // Kiểm tra xem user đã có session trước đó không
        const cookies = req.cookies;
        const existingSession = Object.keys(cookies).find(key => key.startsWith('user_') && cookies[key].includes(email));

        let sessionId;
        if (existingSession) {
            sessionId = JSON.parse(cookies[existingSession]).sessionId;
        } else {
            sessionId = Math.random().toString(36).substring(2, 15);
        }

        console.log(`Session ID: ${sessionId}`);

        // Tạo token JWT có chứa sessionId
        const token = jwt.sign({ 
            name: user.UserName,
            email: user.Email,
            Phone: user.Phone,
            ImgAvt: user.Img_avt,
            sessionId: sessionId // Thêm sessionId vào token
        }, 'SECRET_KEY', { expiresIn: '1d' });

        // Lưu token vào cookie
        res.cookie(`authToken_${sessionId}`, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000 // 1 ngày
        });

        // Lưu thông tin user vào cookie
        res.cookie(`user_${sessionId}`, JSON.stringify({
            name: user.UserName,
            email: user.Email,
            Phone: user.Phone,
            ImgAvt: user.Img_avt,
            sessionId: sessionId
        }), {
            httpOnly: false, // Cho phép FE truy cập
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.send({
            success: true,
            message: 'Login successful',
            user: {
                name: user.UserName,
                email: user.Email,
                phone: user.Phone,
                img_avt: user.Img_avt,
                sessionId: sessionId
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};