const { poolPromise } = require("../dbConfig");
exports.Projects = async (req,res) =>{
    const pool = await poolPromise;
    const query = `SELECT * FROM View_Prj WHERE Manager = @Manager`;
    const Manager = req.query.Manager
    const result = await pool.request()
        .input('Manager', Manager)
        .query(query);
    if(result.recordset){
        return res.json({
            success: true,
            data: result.recordset
        })
    }else{
        return res.json({
            success: false,
            data: []
        })
    }
}