/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Profile from './profile';
import { useUser } from '../../../UserContext';
import axios from 'axios';

export default function SettingUser() {
  const { user, setUser } = useUser(); // Lấy user từ UserContext
  const [UserData, setUserData] = useState({
    name: user?.name|| '',
    email: user?.email || '',
    Phone: user?.Phone || '',
    ImgAvt: user?.ImgAvt|| '',
    CheckSave: false,
  });
  useEffect(() => {
    setUserData({
      name: user?.name || '',
      email: user?.email || '',
      Phone: user?.Phone || '',
      ImgAvt: user?.ImgAvt || '',
    })
  }, [user])
  // console.log(UserData);
  const handleSave = async () => {
    const Form_Data = new FormData();
    if (UserData.ImgAvt) {
        Form_Data.append('avatar', UserData.ImgAvt);
    }
    Form_Data.append('email', UserData.email);
    Form_Data.append('name', UserData.name);
    Form_Data.append('phone', UserData.Phone);
    try {
      const PostInformations = await axios.post('http://localhost:3001/update-informations',
        Form_Data,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        })
      // console.log('Response from upload:', PostImg);
      setUser(PostInformations.data.user);
      console.log(user)
      setUserData({
        name: PostInformations.data.user.name || '',
        email: PostInformations.data.user.email || '',
        Phone: PostInformations.data.user.Phone || '',
        ImgAvt: PostInformations.data.user.ImgAvt || '',
        CheckSave: false,
      });
      // console.log('User updated:', PostInformations.data.user); // In ra thông tin user mới sau khi save thành côn
      console.log('Response from change:', PostInformations.data.user);
    } catch (error) {
      console.log('Error uploading avatar:', error);
    }
  };

  return (
    <div className='bg-light' style={{ minHeight: "100vh" }}>
      <Profile
        ChangeImg={(newImg) => setUserData(PrevData => ({ ...PrevData, ImgAvt: newImg }))} // cach setState prop cua kieu obj
        ChangeName={(newName) => setUserData(PrevData => ({ ...PrevData, name: newName }))}
        ChangePhone={(newPhone) => setUserData(PrevData => ({ ...PrevData, Phone: newPhone }))}
        CheckSave={(newCheckSave) => setUserData(PrevData => ({ ...PrevData, CheckSave: newCheckSave }))}
      />
      <div className='d-flex justify-content-end me-2'>
        <Button disabled={UserData.CheckSave ? false : true} variant="contained" color="success" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
}
