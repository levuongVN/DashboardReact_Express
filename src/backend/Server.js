const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;
app.use (cors());
app.use(bodyParser.json());

// Simulated database
app.get('/',(req, res) => {
    res.json({
        data: [
            { id: 1, name: 'John Doe', email: 'john.doe@example.com',password: '12345678@', phone: '12345678',imageAvt:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"},
            { id: 2, name: 'Jane Doe', email: 'jane.doe@example.com', password: '87654321@', phone: '98765432'},
        ]
    });
})
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});