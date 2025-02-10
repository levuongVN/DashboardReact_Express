const { poolPromise } = require('../dbConfig');
exports.colleagues = async (req, res) => {
        const pool = await poolPromise;
        const statusWorker = req.query.stt
        // console.log(statusWorker)
        const query = `
        SELECT * FROM ColleaguesInfo 
        WHERE EmailColleagues IN 
        (SELECT EmailColleagues FROM colleagues 
        WHERE WhoInvited = @email )
        ${statusWorker !=='All' ? 'AND StatusWork = @stt' :''}
        `
        const queryCountStt = `
         SELECT StatusWork, COUNT(StatusWork) AS CountGr FROM colleagues GROUP BY(StatusWork);
        `
        const CountAll =`
        SELECT COUNT(StatusWork) AS CountAll FROM colleagues
        `
        const result = await pool.request()
        .input('email', req.query.email)
        .input('stt', statusWorker)
        .query(query)
        const resultCountStt = await pool.request().query(queryCountStt)
        const resultCountAll = await pool.request().query(CountAll);
        // console.log(resultCountStt.recordset)
        // console.log(resultCountAll.recordset)
        if(result.recordset.length ===0){
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }else{
            return res.json({
                success: true,
                message: 'List of colleagues',
                colleagues: result.recordset,
                countStt: resultCountStt.recordset,
                countAll: resultCountAll.recordset,
            });
        }
        // console.log('Received email:', req.query.email);
    };