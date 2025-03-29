// In Team.js
const { toInteger } = require("lodash");
const { poolPromise } = require("../dbConfig");

exports.Team = async (req, res) => {
    const { NameTeam, Email, ProjectID } = req.body;
    // Add your team saving logic here
    const InsertTeam = `
        EXEC InsertTeam
        @TeamName = @NameTeam,
        @LeaderEmail = @Email,
        @ProjectID = @ProjectID
    `
    const pool = await poolPromise
    pool.request()
    .input('NameTeam', NameTeam)
    .input('Email', Email)
    .input('ProjectID', ProjectID)
    .query(InsertTeam)
    return(
        res.json({
            success: true,
            message: 'Team created successfully'
        })
    )
}

// Get Team exists
exports.TeamsInvite = async (req, res) => {
    const { TeamName,SenderEmail, ReceiverEmail,Status,Role } = req.body;
    // console.log(ReceiverEmail) // This is Array
    const Query_GetIDTeam = `
        SELECT TeamID FROM Teams WHERE TeamName = @TeamName
    `
    const Query_Exec = `
        EXEC InsertInviteTeam
            @TeamID = @TeamID,
            @SenderEmail = @SenderEmail,
            @ReceiverEmail = @ReceiverEmail,
            @Status = @Status,
            @Role = @Role
    `
    const pool = await poolPromise
    const teamId = await pool.request()
                .input('TeamName', TeamName)
                .query(Query_GetIDTeam)
    // Kiểm tra kỹ hơn
    if (teamId.recordset && teamId.recordset[0] && teamId.recordset[0].TeamID) {
        await Promise.all(ReceiverEmail.map(async item => {
            await pool.request()
                .input('TeamID', toInteger(teamId.recordset[0].TeamID))
                .input('SenderEmail', SenderEmail)
                .input('ReceiverEmail', item)
                .input('Status', Status)
                .input('Role', Role)
                .query(Query_Exec);
        }));
        // console.log(true)
        return res.json({
            success: true,
            message: "Invited successfully"
        });
    }else{
        // console.log(false)
        return res.json({
            success: false,
            message: "Team not found"
        });
    }
}
exports.GetInviteTeam = async(req,res)=>{
    const ReceiverEmail = req.query.ReceiverEmail
    const Query_GetInvite = `
    SELECT * FROM View_TeamInvites WHERE ReceiverEmail = @ReceiverEmail;
`
    try{
        const pool = await poolPromise
        const result = await pool.request()
                        .input('ReceiverEmail',ReceiverEmail)
                        .query(Query_GetInvite)
        // console.log(result)
        if(result.recordset.length === 0){
            return(
                res.json({
                    type:'InviteTeam',
                    success: false,
                })
            )
        }
        return(
            res.json({
                type:'InviteTeam',
                success: true,
                data: result.recordset || null
            })
        )
    }catch(e){
        console.log(e)
        return(
            res.json({
                success: false,
                message: "Error"
            })
        )
    }
}
exports.AddTeamMembers = async (req, res) => {
    const { AcpStt, TeamName, MemberEmail, Role } = req.body;
    try {
        const pool = await poolPromise;
        const GetTeamID = `
            SELECT TeamID FROM Teams WHERE TeamName = @TeamName
        `;
        const DeleteInvites = `
            DELETE FROM TeamInvites 
            WHERE TeamID = @TeamID AND ReceiverEmail = @MemberEmail
        `;
        // Get TeamID
        const teamId = await pool.request()
            .input('TeamName', TeamName)
            .query(GetTeamID);
        if (!teamId.recordset[0]?.TeamID) {
            return res.json({
                success: false,
                message: "Team not found"
            });
        }

        if (AcpStt) {
            // If accepted, add member
            const Query_InsertTeamMembers = `
                EXEC InsertTeamMember
                @TeamID = @TeamID,
                @MemberEmail = @MemberEmail,
                @Role = @Role
            `;

            const ReqInsertMembers = await pool.request()
                .input('TeamID', teamId.recordset[0].TeamID)
                .input('MemberEmail', MemberEmail)
                .input('Role', Role)
                .query(Query_InsertTeamMembers);
            if (ReqInsertMembers.rowsAffected[0] > 0) {
                // Delete invitation after successful addition
                await pool.request()
                    .input('TeamID', teamId.recordset[0].TeamID)
                    .input('MemberEmail', MemberEmail)
                    .query(DeleteInvites);
                    
                return res.json({
                    success: true,
                    message: "Member added successfully"
                });
            }
        } else {
            // If rejected, just delete the invitation
            await pool.request()
                .input('TeamID', teamId.recordset[0].TeamID)
                .input('MemberEmail', MemberEmail)
                .query(DeleteInvites);
                
            return res.json({
                success: true,
                message: "Invitation rejected successfully"
            });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.json({
            success: false,
            message: AcpStt ? "Failed to add member" : "Failed to reject invitation"
        });
    }
};