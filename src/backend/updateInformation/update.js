const express = require('express');
const { poolPromise } = require('../dbConfig');
const fs = require('fs');
const path = require('path');
const app = express();
const jwt = require('jsonwebtoken');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
exports.Update = async function(req, res) {
    console.log(req.user)
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
            const oldAvatarPath = TakeDataOld.recordset[0].Img_avt;
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
        const token = jwt.sign({ 
            name: name,
            email: email,
            Phone: phone,
            ImgAvt: newAvatar,
        }, 'SECRET_KEY', { expiresIn: '1d' });

        const sessionId = req.user.sessionId;  // Lấy sessionId từ token cũ
        res.cookie(`authToken_${sessionId}`, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000 // 1 ngày
        });

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
};