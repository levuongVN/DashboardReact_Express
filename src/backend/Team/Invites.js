const { poolPromise } = require('../dbConfig')
exports.Invites = async (req, res) => {
    try {
        const queryCheckColleagues = `
            SELECT * FROM colleagues WHERE EmailColleagues = @email
        `;
        const queryCheckProjectNames = `
        SELECT ProjectName from Hire where EmailPersonInvite = @email
        `
        const { email, emailInvited, role, jobType, jobTitles, notes, projectName } = req.body;
        console.log(email)
        const pool = await poolPromise;
        const checkProjectNames = await pool.request()
        .input('email', email)
        .input('projectName', projectName)
        .query(queryCheckProjectNames)
        if(checkProjectNames.recordset === projectName){
            return res.send({
                    success: false,
                    message:"The project has been existed"
                })
        }else{
            const InsertHire = `
           EXEC InsertHire 
            @EmailPersonInvite = @email, 
            @EmailPersonInvited = @emailInvited, 
            @ProjectName = @projectName,
            @Decentralization = @Decentralization, 
            @JobTitles = @jobTitles, 
            @JobTypes = @jobTypes,
            @Notes = @notes, 
            `
            const params = { 
                email, 
                emailInvited, 
                projectName, 
                Decentralization: role, 
                jobTitles, 
                jobTypes: jobType, 
                notes 
            };
            
            const sqlRequest = pool.request();
            Object.entries(params).forEach(([key, value]) => {
                sqlRequest.input(key, value);
            });
            // check sqlRequest.input(key, value);
            console.log(sqlRequest);
            // console.log(InsertHire);
            const QueryHire = await sqlRequest.query(InsertHire);
            if(QueryHire.rowsAffected > 0){
                console.log('ok')
                return res.json({
                    success: true,
                });
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
exports.AcceptInvite = async(req, res) => {
    const {AcpStt, email,ProjectName} = req.body;
    const queryCheckColleagues = `
            SELECT * FROM colleagues WHERE EmailColleagues = @email
    `;
    const queryUpdateStt = `
    UPDATE Hire SET AcpStt = @AcpStt WHERE EmailPersonInvite = @email
    `
    if(AcpStt){
        try {
            const pool = await poolPromise;
            const result = await pool.request()
               .input('AcpStt', AcpStt)
               .input('email', email)
               .query(queryUpdateStt);
               // Check colleagues are existed
            const query = await pool.request().input('email', email).query(queryCheckColleagues);
            console.log(query.recordset[0])
            if(query.recordset[0] !== undefined){
                const UpdateColleagues = `
                UPDATE colleagues SET StatusWork = 'Active' WHERE EmailColleagues = @email
                `
                const resultColleagues = await pool.request().input('email', email).query(UpdateColleagues);
                await pool.request()
                .input('PrjName', ProjectName)
                .query(
                    `DELETE FROM Hire WHERE ProjectName = @PrjName`)
                console.log(true)
                if(resultColleagues.rowsAffected > 0){
                    return res.json({
                        success: true,
                        message: 'Successfully',
                        data: result.recordset
                    });
                }else{
                    return res.json({
                        success: false,
                        message: 'Your colleague are being active'
                    });
                }
            }else{
                // In case the user not exists in the colleagues database
                const TakeEmailInvited = await pool.request().input('email', email)
                .query('SELECT * FROM Hire WHERE EmailPersonInvite = @email')

                const insertColleaguesQuery = `
                    INSERT INTO colleagues (EmailColleagues, Country, DateStart, TypeJob, JobTitle, StatusWork, WhoInvited)
                    VALUES (@email, @CountryID, GETDATE(), @TypeJob, @JobTitle, 'Active', @emailInvited)
                    `
                const InformationsInvite = {
                    email: TakeEmailInvited.recordset[0].EmailPersonInvite,
                    TypeJob: TakeEmailInvited.recordset[0].JobTypes,
                    JobTitle: TakeEmailInvited.recordset[0].JobTitles,
                    WhoInvited: TakeEmailInvited.recordset[0].EmailPersonInvited
                }
                const GetCountry = await pool.request().input('email', InformationsInvite.email)
                .query(`SELECT CountryID FROM users WHERE Email = @email`)

                await pool.request()
                .input('email', InformationsInvite.email)
                .input('CountryID', GetCountry.recordset[0].CountryID)
                .input('TypeJob', InformationsInvite.TypeJob)
                .input('JobTitle', InformationsInvite.JobTitle)
                .input('emailInvited', InformationsInvite.WhoInvited)
                .query(insertColleaguesQuery);
                await pool.request()
                .input('PrjName', ProjectName)
                .query(
                    `DELETE FROM Hire WHERE ProjectName = @PrjName`)
                // // console.log(false)
            }
            if(result.rowsAffected > 0){
                return res.json({
                    success: true,
                    message: 'Successfully',
                    data: result.recordset
                });
            }else{
                return res.status(404).json({
                    success: false,
                    message: 'Not found'
                });
            }
        } catch (error) {
            console.error( error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }else{
        const query = `DELETE Hire WHERE ProjectName = @ProjectName`
        const pool = await poolPromise;
        const result = await pool.request()
        .input('ProjectName', ProjectName)
        .query(query);
        return(
            res.json({
                success: false,
                message: 'Rejected'
            })
        )

    }
};