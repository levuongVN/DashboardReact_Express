import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';

function AvatarUpload() {
  const [avatar, setAvatar] = useState(null); // File được chọn
  const [savedAvatar, setSavedAvatar] = useState(''); // Avatar đã lưu
  const { user, setUser } = useUser(); // Lấy user từ UserContext

  // Xử lý chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file); // Chỉ lưu file, không hiển thị preview
  };

  // Xử lý upload
  const handleUpload = async () => {
    if (!avatar) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', avatar);

    try {
      const response = await axios.post('http://localhost:3001/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Sau khi lưu thành công, hiển thị ảnh mới
      setSavedAvatar(response.data.path);
      setUser(prevUser => ({...prevUser, ImgAvt: response.data.path })); // Cập nhật avatar mới vào user
      alert('Avatar updated successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload avatar');
    }
  };

  return (
    <div className='bg-light'>
      <h2>Update Avatar</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button className='bg-white' onClick={handleUpload}>Save</button>

      {savedAvatar && (
        <div>
          <h3>update Avatar:</h3>
          <img src={savedAvatar} alt="Avatar" width={150} />
        </div>
      )}
      {/* New img */}
      {user?.ImgAvt && (
        // console.log(user.ImgAvt)
        <div>
          <h3>Current Avatar:</h3>
          <img src={user?.ImgAvt} alt="Avatar" width={150} />
        </div>
    )}
    {
      console.log(user?.ImgAvt.length +" "+ "https://i.pinimg.com/474x/75/98/a2/7598a2291f7a6c6a220ffb010dd3384e.jpg".length)
    }
    <img src={user?.ImgAvt} alt="Avatar" width={150} />
    </div>
  );
}

export default AvatarUpload;
