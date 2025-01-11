import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';

function AvatarUpload() {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    avatar: null, // Nếu muốn upload file
});

const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormValues({
        ...formValues,
        [name]: files ? files[0] : value, // Lưu file hoặc giá trị text
    });
};

const handleSubmit = async (e) => {
    e.preventDefault();

    // Tạo FormData
    const formData = new FormData();
    formData.append("name", formValues.name);
    formData.append("email", formValues.email);

    // Gửi FormData qua fetch
    try {
        const response = await fetch("http://localhost:3001/submit", {
            method: "POST",
            body: formData, // Gửi FormData
        });

        const data = await response.json();
        console.log("Server response:", data);
    } catch (error) {
        console.error("Error:", error);
    }
};

return (
    <form onSubmit={handleSubmit}>
        <input
            type="text"
            name="name"
            placeholder="Name"
            value={formValues.name}
            onChange={handleChange}
            required
        />
        <input
            type="email"
            name="email"
            placeholder="Email"
            value={formValues.email}
            onChange={handleChange}
            required
        />
        <button type="submit" className='bg-white'>Submit</button>
    </form>
);
};

export default AvatarUpload;
