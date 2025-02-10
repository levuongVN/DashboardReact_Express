/* eslint-disable no-unused-vars */
const express = require('express');
const app = express();
const { poolPromise } = require('../dbConfig');
exports.SignUp = async (req, res) => {
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
};