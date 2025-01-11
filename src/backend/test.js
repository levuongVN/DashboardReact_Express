const express = require("express");
const multer = require("multer");
const cors = require("cors");

const app = express();
const upload = multer({ dest: "uploads/" }); // Lưu file vào thư mục "uploads"

// Cho phép React truy cập server bằng CORS
app.use(cors());

// Endpoint xử lý dữ liệu
app.post("/submit", upload.single("avatar"), (req, res) => {
    // `req.body` chứa dữ liệu text từ FormData
    console.log("Body:", req.body);

    // `req.file` chứa thông tin file được tải lên
    if (req.file) {
        console.log("File:", req.file);
    }

    res.json({
        success: true,
        message: "Form data received successfully",
        data: req.body,
        file: req.file,
    });
});

// Start server
const PORT = 3008;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
