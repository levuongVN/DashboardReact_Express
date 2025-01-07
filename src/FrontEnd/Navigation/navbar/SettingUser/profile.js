/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Avatar, Button, colors, InputLabel } from '@mui/material';
import { TextField } from '@mui/material';
import { Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../../UserContext';

const TreeItemUserLink = [
    {
        Name: "Avatar",
        href: '#ImageAvatar',
    },
    {
        Name: "Name",
        href: '#Email',
    },
    {
        Name: "Phone",
        href: '#Phone',
    },
    {
        Name: "Email",
        href: '#Email',
    },
    {
        Name: "Password",
        href: '#Password',
    },
]
export default function Profile() {
    const { user, setUser } = useUser(); // Lấy user từ UserContext
    const navigate = useNavigate();
    const [UserData, setUserData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.Phone || '',
        ImgAvt: user?.ImgAvt || '',
        ImgAvtURL: ''
    })
    // console.log(typeof UserData.ImgAvt)
    useEffect(() => {
        if (user) {
            setUserData({
                name: user?.name,
                email: user?.email,
                phone: user?.Phone,
                ImgAvt: user?.ImgAvt,
                ImgAvtURL: ''
            })
        }
    }, [user]);

    // useEffect(() => {
    //     // Kiểm tra độ dài của đường dẫn ảnh
    //     if (UserData.ImgAvt && UserData.ImgAvt.length > 0) {
    //         console.log(`Độ dài của đường dẫn ảnh: ${UserData.ImgAvt.length}`);
    //         console.log("Do dai mong muon: "+ UserData.ImgAvt.length)
    //     }
    // }, [UserData.ImgAvt]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUserData(prevData => ({ ...prevData, ImgAvt: file })); // Lưu tệp gốc
            const fileURL = URL.createObjectURL(file);
            setUserData(prevData => ({ ...prevData, ImgAvtURL: fileURL })); // Lưu ObjectURL cho hiển thị
        }
    }
    const handleSave = async () => {
        const Form_Data = new FormData();
        Form_Data.append('avatar', UserData.ImgAvt); // Gửi tệp gốc
        Form_Data.append('email', UserData.email);

        try {
            const PostAPI = await axios.post('http://localhost:3001/upload-avatar',
                Form_Data,
                {
                    headers: {'Content-Type': 'multipart/form-data'},
                    withCredentials: true
                });
            console.log('Response from upload:', PostAPI.data); // Thêm log để kiểm tra phản hồi
            setUser(prevUser => ({...prevUser, ImgAvt: PostAPI.data.path })); // Cập nhật avatar mới vào user
            console.log('Updated user avatar:', PostAPI.data.path); // Thêm log để kiểm tra URL mới
        } catch (error) {
            console.log('Error uploading avatar:', error); // Thêm log để kiểm tra lỗi
        }
    };

    return (
        <div className='bg-white flex'>
            <div className='bg-light'>
                <Box className="d-none d-md-block" sx={{ minHeight: "100vh", minWidth: 250 }}>
                    <SimpleTreeView>
                        <TreeItem itemId="grid" label="General">
                            {Object.keys(TreeItemUserLink).map(function (key) {
                                return (
                                    <div key={key} className='mt-3 border-bottom'>
                                        <a href={TreeItemUserLink[key].href}>{TreeItemUserLink[key].Name}</a>
                                    </div>
                                )
                            })}
                        </TreeItem>
                    </SimpleTreeView>
                </Box>
            </div>

            <div className='col bg-grey ms-3'>
                <div className="close d-flex justify-content-end me-4 mt-2">
                    <button onClick={() => {
                        navigate('/')
                    }} type="button" className="btn btn-outline-info">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
                <div className='row'>
                    <div className='col  d-flex'>
                        <div className='textTitle  col-md-3 col'>
                            <h4>Profile</h4>
                            <p>Set your account details</p>
                        </div>
                        <div className='col-md-9 d-flex'>
                            <div className='detailsInformation d-flex align-items-center' style={{ width: "max-content" }}>
                                <div>
                                    <div className='Name_Phone'>
                                        <TextField
                                            label="Name"
                                            id="outlined-size-small"
                                            value={UserData.name || ''}
                                            size="small"
                                            sx={{ width: '35%' }}
                                            className='me-2'
                                        />
                                        <TextField
                                            label="Phone"
                                            id="outlined-size-small"
                                            value={UserData.phone || ''}
                                            size="small"
                                            sx={{ width: '35%' }}
                                        />
                                    </div>
                                    <div className='Email'>
                                        <TextField
                                            label="Email"
                                            id="outlined-size-small"
                                            value={UserData.email}
                                            size="small"
                                            sx={{ width: '71%' }}
                                            className='mt-4'
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='AvtUser'>
                                <Avatar 
                                    sx={{ width: 75, height: 75 }} 
                                    className='mb-2 border' 
                                    alt="User" 
                                    src={UserData.ImgAvtURL ==='' ? UserData.ImgAvt : UserData.ImgAvtURL}
                                />
                                <input
                                    accept="image/*"
                                    className="hidden"
                                    id="contained-button-file"
                                    type="file"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="contained-button-file">
                                    <Button variant="contained" size='small' color="primary" component="span">
                                        Upload
                                    </Button>
                                </label>
                                <Button variant="contained" size='small' color="secondary" onClick={handleSave} className='ms-2'>
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
