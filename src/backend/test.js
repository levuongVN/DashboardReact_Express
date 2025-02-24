/* eslint-disable no-unused-vars */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const { Login, CheckAuth } = require('./Login_SignUp_LogOut/Login');
const { SignUp } = require('./Login_SignUp_LogOut/Sign_up');
const { LogOut } = require('./Login_SignUp_LogOut/Log_out');
const { Update } = require('./updateInformation/update');
const { colleagues } = require('./Team/Colleagues');
const { Invites,AcceptInvite } = require('./Team/Invites');
const { GetInvites } = require('./Team/getInvites');
const WebSocket = require("ws"); // Thư viện WebSocket cho Node.js
const http = require("http"); // Dùng để tạo server HTTP
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = 3001;

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware kiểm tra authentication
const checkAuth = (req, res, next) => {
    const cookies = req.cookies;
    const sessionId = req.headers['x-session-id']; // Lấy sessionId từ header
    const tokenKey = sessionId ? `authToken_${sessionId}` : Object.keys(cookies).find(key => key.startsWith('authToken_'));
    const token = cookies[tokenKey];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, 'SECRET_KEY', (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = decoded;
        next();
    });
};
// Cấu hình cho multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// WebSocket logic
const UserEmail = {}; // Object để lưu các kết nối

wss.on("connection", (ws) => {
    console.log("New client connected");

    ws.on('message', (invite) => {
        try {
            const data = JSON.parse(invite);
            // console.log("Received: ", data);

            if (data.type === "online") {
                UserEmail[data.email] = ws;
                ws.email = data.email;
                // console.log(`User ${data.email} registered`);
            }
            if(data.type === "invite"){
               const toUserEmail = data.to;
               if(UserEmail[toUserEmail]){
                   UserEmail[toUserEmail].send(JSON.stringify(data));
               }else{
                   ws.send(JSON.stringify({type: "error", message: "User not found"}));
               }
            }
            if(data.type ==="AcpStt"){
              
            }
        } catch (error) {
            console.error("Error processing message:", error);
        }
    });

    ws.on('close', () => {
        console.log(`User ${ws.email} disconnected`);
        if (ws.email) {
            delete UserEmail[ws.email];
        }
    });

    ws.on('error', (error) => {
        console.error("WebSocket error:", error);
    });
});

// API để kiểm tra authentication (GET)
app.get('/check-auth', checkAuth, CheckAuth);

// API đăng nhập
app.post('/login', Login);

// API đăng xuất
app.post('/logout', LogOut);

// API để đăng ký user mới (POST)
app.post('/users', SignUp);

//Changes informations user
app.post('/update-informations', upload.single('avatar'), checkAuth, Update);
// ... existing code ...

app.get('/colleagues', colleagues)
app.post('/invites',Invites);
app.get('/InviteGet', GetInvites); 
app.post('/Accept-invite', AcceptInvite);
// ... existing code ...

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
