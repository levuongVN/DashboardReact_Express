const { poolPromise } = require('../dbConfig')
exports.GetInvites = async (req, res) => {
    // console.log(req.query.email)
    try {
        const queryGetHire = `
        SELECT Hire.EmailPersonInvite,Hire.EmailPersonInvited,Hire.ProjectName, users.Img_avt FROM Hire
        JOIN users ON Hire.EmailPersonInvited = users.Email
        WHERE Hire.EmailPersonInvite = @email
        AND Hire.EmailPersonInvited != @email;
        `;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', req.query.email)  // Dùng query thay vì params
            .query(queryGetHire);
        // console.log(result)
        if (result.recordset.length > 0) {
            return res.json({
                success: true,
                data: result.recordset
            });
        } else {
            return res.json({
                success: false,
                message: 'Not found'
            });
        }
    } catch (error) {
        console.error('Lỗi trong InviteGet:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
