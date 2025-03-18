// In Team.js
const { poolPromise } = require ("../dbConfig");
// Get Team exists
exports.TeamsInvite = async (req, res) => {
    const { Members } = req.body;
    console.log(Members)
}
exports.Team = async (req, res) => {
    const {NameTeam, Email,ProjectID} = req.body;
    // Add your team saving logic here
    const InsertTeam = `
        EXEC InsertTeam
        @TeamName = @NameTeam,
        @LeaderEmail = @Email,
        @ProjectID = @ProjectID
    `
    const pool = await poolPromise
    // pool.request()
    // .input('NameTeam', NameTeam)
    // .input('Email', Email)
    // .input('ProjectID', ProjectID)
    // .query(InsertTeam)
    res.json({ success: true, message: "Team saved successfully" });
}
exports.AddTeamMembers = async (req, res) => {
    const { TeamName, members } = req.body;
    try {
        const pool = await poolPromise;
        
        // Lấy TeamID từ tên team
        const getTeamId = await pool.request()
            .input('TeamName', TeamName)
            .query('SELECT TeamID FROM Teams WHERE TeamName = @TeamName');
        
        const teamId = getTeamId.recordset[0].TeamID;

        // Thêm từng thành viên vào TeamDetail bằng stored procedure
        for (const member of members) {
            await pool.request()
                .input('TeamID', teamId)
                .input('MemberEmail', member.id)
                .input('Role', member.role)
                .execute('InsertTeamMember');  // Gọi stored procedure AddTeamMember
        }

        res.json({ success: true, message: "Team members added successfully" });
    } catch (error) {
        console.error('Error adding team members:', error);
        res.status(500).json({ success: false, message: "Error adding team members" });
    }
};