const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;
app.use (cors());
app.use(bodyParser.json());

let database = [
]

// Simulated database
app.get('/',(req, res) => {
    res.json({
        data: database
    });
})

app.post('/', (req, res) => {
    const newUser = {
        id: database.length + 1,
        ...req.body,
    };
    database.push(newUser);
    res.status(200).json({
        success: true,
        data: database
    });
})

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});