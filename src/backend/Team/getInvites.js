const {poolPromise} = require('../dbConfig')
exports.GetInvites = async (req, res) => {
    // console.log(req.query.email)
    try {
        const query = `
            SELECT h.*, u.Img_avt 
            FROM Hire h
            JOIN Users u ON h.EmailPersonIsInvited = u.Email
            WHERE h.EmailPersonInvite = @email 
            AND h.EmailPersonIsInvited != @email;
        `;
        const pool = await poolPromise; // Bạn sai ở đây!
        const result = await pool.request()
            .input('email', req.query.email)  // Dùng query thay vì params
            .query(query);

        if (result.recordset.length > 0) {
            return res.json({
                success: true,
                data: result.recordset
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Not found'
            });
        }
    } catch (error) {
        console.error('Lỗi trong InviteGet:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.AcceptInvite = async(req, res) => {
    const {AcpStt, email} = req.body;
    const query = `
    UPDATE Hire SET AcpStt = @AcpStt WHERE EmailPersonInvite = @email
    `
    // const pool = await poolPromise
    // .input('AcpStt', AcpStt)
    // .input('email', email)
    // await pool.request().query(query)
};