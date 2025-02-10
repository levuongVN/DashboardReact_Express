const { poolPromise } = require('../dbConfig')
exports.Invites = async (req, res) => {
    try {
        const queryCheckColleagues = `
            SELECT * FROM colleagues WHERE EmailColleagues = @email
        `;
        const queryCheckHire = `SELECT * FROM Hire WHERE EmailHire = @email`
        const { email, emailIsInvited, role, jobType, jobTitles, notes, projectName } = req.body;
        const pool = await poolPromise;

        const check = await pool.request()
            .input('email', email)
            .query(queryCheckColleagues);

        const checkAcpSTT = await pool.request()
            .input('email', email)
            .query(queryCheckHire)
        if (checkAcpSTT.recordset.length > 0) {
            if (checkAcpSTT.recordset.Acp) {
                if (check.recordset.length > 0) {
                    const today = new Date();
                    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

                    // if the user is invited or exist
                    const query = `
                        UPDATE colleagues 
                        SET DateStart = @dateStart, TypeJob = @jobType, JobTitle = @jobTitles, StatusWork = 'Active'
                        WHERE EmailColleagues = @email
                    `;

                    await pool.request()
                        .input('email', email)
                        .input('emailIsInvited', emailIsInvited)
                        .input('projectName', projectName)
                        .input('decentralization', role)
                        .input('dateStart', formattedDate)
                        .input('jobType', jobType)
                        .input('jobTitles', jobTitles)
                        .input('notes', notes)
                        .query(query)

                } else {
                    const today = new Date();
                    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
                    // Make a invites and save to the database
                    const queryInsert = `
                        INSERT INTO Hire (EmailPersonInvite, EmailPersonIsInvited, ProjectName, Decentralization, JobTitles, JobTypes, Notes)
                        VALUES (@email, @emailIsInvited, @projectName, @decentralization, @jobTitles, @jobType, @notes)`;

                    await pool.request()
                        .input('email', email)
                        .input('emailIsInvited', emailIsInvited)
                        .input('projectName', projectName)
                        .input('decentralization', role)
                        .input('dateStart', formattedDate)
                        .input('jobType', jobType)
                        .input('jobTitles', jobTitles)
                        .input('notes', notes)
                        .query(queryInsert)
                }
            }else{
                res.json({ success:false });
            }
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while processing invite'
        });
    }
}