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
    return (
        res.json({
            success: true,
            message: 'Team created successfully'
        })
    )
}

// Get Team exists
exports.TeamsInvite = async (req, res) => {
    const { TeamName, SenderEmail, ReceiverEmail, Status, Role } = req.body;
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
        .query(`SELECT TeamID FROM Teams WHERE TeamName = @TeamName`)
    // Kiểm tra kỹ hơn
    // console.log(teamId.recordset[0].TeamID + TeamName)
    if (teamId.recordset[0].TeamID) {
        await Promise.all(ReceiverEmail.map(async item => {
            await pool.request()
                .input('TeamID', toInteger(teamId.recordset[0].TeamID))
                .input('SenderEmail', SenderEmail)
                .input('ReceiverEmail', typeof(item) === 'object' ? item.EmailColleagues:item)
                .input('Status', Status)
                .input('Role', typeof(item) === 'object' ? item.role:Role)
                .query(Query_Exec);
            // console.log(typeof(item) === 'object' ? item:"null")
        }));
        // console.log(true)
        return res.json({
            success: true,
            message: "Invited successfully"
        });
    } else {
        // console.log(false)
        return res.json({
            success: false,
            message: "Team not found"
        });
    }
}
exports.GetInviteTeam = async (req, res) => {
    const ReceiverEmail = req.query.ReceiverEmail
    const Query_GetInvite = `
    SELECT * FROM View_TeamInvites WHERE ReceiverEmail = @ReceiverEmail;
`
    try {
        const pool = await poolPromise
        const result = await pool.request()
            .input('ReceiverEmail', ReceiverEmail)
            .query(Query_GetInvite)
        // console.log(result)
        if (result.recordset.length === 0) {
            return (
                res.json({
                    type: 'InviteTeam',
                    success: false,
                })
            )
        }
        return (
            res.json({
                type: 'InviteTeam',
                success: true,
                data: result.recordset || null
            })
        )
    } catch (e) {
        console.log(e)
        return (
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

exports.GetTeam = async (req, res) => {
    const LeaderEmail = req.query.EmailLeader;
    const QueryViewTeam = `
    SELECT TeamID,TeamName,LeaderName,LeaderAvatar,MemberName,MemberRole,MemberAvatar FROM View_TeamMembers WHERE LeaderEmail = @LeaderEmail;
    `
    // Sửa thành await poolPromise
    const pool = await poolPromise; // Thêm await ở đây
    const result = await pool.request()
        .input('LeaderEmail', LeaderEmail)
        .query(QueryViewTeam);
    if (result.recordset[0] === undefined) {
        return (
            res.json({
                success: false,
                message: "Team not found"
            })
        )
    }
    return (
        res.json({
            success: true,
            data: result.recordset || null
        })
    )
}

// Add these new exports to your existing Team.js file

exports.GetTeamDetails = async (req, res) => {
    const { TeamID } = req.query;
    try {
        const pool = await poolPromise;
        const query = `
            SELECT * FROM View_TeamMembers 
            WHERE TeamID = @TeamID;
        `;
        const result = await pool.request()
           .input('TeamID', TeamID)
           .query(query);
        if (result.recordset[0] === undefined) {
            return (
                res.json({
                    success: false,
                    message: "Team not found"
                })
            )
        }
        return (
            res.json({
                success: true,
                data: result.recordset || null
            })
        )
    } catch (e) {
        console.log(e)
    }
};

exports.UpdateTeamDetails = async (req, res) => {
    const { TeamID, TeamName, Description, Members, DeletedMembers } = req.body;
    try {
        const pool = await poolPromise;
        
        // Update Team Details
        const updateTeamDetailsQuery = `
            UPDATE Teams
            SET TeamName = @TeamName, Description = @Description
            WHERE TeamID = @TeamID;
        `;
        await pool.request()
          .input('TeamID', TeamID)
          .input('TeamName', TeamName)
          .input('Description', Description)
          .query(updateTeamDetailsQuery);

        // Handle member deletions if any
        if (DeletedMembers && DeletedMembers.length > 0) {
            // console.log(DeletedMembers)
            // Xóa từng thành viên trong danh sách xóa
            const deleteMemberQuery = `
                DELETE FROM TeamDetail
                WHERE TeamID = @TeamID AND MemberEmail = @MemberEmail
            `;
            await Promise.all(DeletedMembers.map(async memberEmail => {
                await pool.request()
                    .input('TeamID', TeamID)
                    .input('MemberEmail', memberEmail)
                    .query(deleteMemberQuery);
            }));
        }

        return res.json({
            success: true,
            message: 'Team details updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating team details:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update team details',
            error: error.message
        });
    }
};

exports.DeleteTeam = async (req, res) => {
    const { TeamID } = req.body;
    // console.log(TeamID)
    try {
        const pool = await poolPromise;
        
        // First delete all team members
        await pool.request()
            .input('TeamID', TeamID)
            .query('DELETE FROM TeamDetail WHERE TeamID = @TeamID');
            
        // Then delete all team invites
        await pool.request()
            .input('TeamID', TeamID)
            .query('DELETE FROM TeamInvites WHERE TeamID = @TeamID');
            
        // Finally delete the team itself
        const result = await pool.request()
            .input('TeamID', TeamID)
            .query('DELETE FROM Teams WHERE TeamID = @TeamID');
            
        if (result.rowsAffected[0] > 0) {
            return res.json({
                success: true,
                message: 'Team deleted successfully'
            });
        } else {
            return res.json({
                success: false,
                message: 'Team not found'
            });
        }
    } catch (error) {
        console.error('Error deleting team:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete team',
            error: error.message
        });
    }
};