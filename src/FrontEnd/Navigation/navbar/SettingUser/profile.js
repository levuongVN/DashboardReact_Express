/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Avatar, Button } from '@mui/material';
import { TextField } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../../UserContext';

const TreeItemUserLink = [
    {
        Name: "Information",
        href: '#information',
    },
    {
        Name: "Projects",
        href: '#projects',
    },
    {
        Name: "Coleagues",
        href: '#coleagues',
    },
    {
        Name: "Teams",
        href: '#teams',
    },
    {
        Name: "Password",
        href: '#Password',
    },
]
export default function Profile({ChangeImg, ChangeName,ChangePhone,CheckSave}) {
    const { user, setUser } = useUser(); // Lấy user từ UserContext
    // console.log(user?.Phone)
    const navigate = useNavigate();
    const [DataChanges, setDataChanges] = useState({
        name: user?.name|| '',
        email: user?.email || '',
        Phone: user?.Phone || '',
        ImgAvt: user?.ImgAvt|| '',
        ImgUrl: ''
    })
    useEffect(() => {
        setDataChanges({
            name: user?.name|| '',
            email: user?.email || '',
            Phone: user?.Phone || '',
            ImgAvt: user?.ImgAvt|| '',
            ImgUrl: ''
        })
    },[user])
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            ChangeImg(file); // Gọi hàm ChangeImg để cập nhật ảnh
            CheckSave(true);
            const fileURL = URL.createObjectURL(file);
            setDataChanges(prevData => ({...prevData, ImgUrl: fileURL })); // Cập nhật ảnh mới vào state
        } else {
            console.log('No file selected'); // Thêm thông báo nếu không có tệp nào được chọn
        }
    }
    const handleInputChangeName = (e) => {
        ChangeName(e.target.value)
        if(e.target.value === user?.name){
            CheckSave(false)
        }else{
            CheckSave(true)
        }
        setDataChanges(prevData => ({...prevData, name:e.target.value})); //
        // console.log(e.target.value);
    }
    const handleInputChangePhone = (e) => {
        ChangePhone(e.target.value)
        if(e.target.value === user?.Phone){
            CheckSave(false)
        }else{
            CheckSave(true)
        }
        setDataChanges(prevData => ({...prevData, Phone:e.target.value})); //
        // console.log(e.target.value);
    }
    return (
        <div className='bg-light flex border' >
            {/* Tree content  menu */}
            <div className='bg-light'>
                <Box className="d-none d-md-block" sx={{ minHeight: "100%", minWidth: 250 }}>
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
                <div className='row mb-1'>
                    <div className='col d-block d-md-flex'>
                        <div className='textTitle col-md-3 col-12'>
                            <h4>Profile</h4>
                            <p>Set your account details</p>
                        </div>
                        <div className='col-md-9 d-block col-12 d-md-flex '>
                            <div className='detailsInformation d-flex align-items-center' style={{ width: "max-content" }}>
                                <div>
                                    <div className='Name_Phone'>
                                        <TextField
                                            label="Name"
                                            id="outlined-size-small"
                                            value={DataChanges.name ||''}
                                            size="small"
                                            sx={{ width: '35%' }}
                                            className='me-2'
                                            onChange={handleInputChangeName}
                                        />
                                        <TextField
                                            label="Phone"
                                            id="outlined-size-small"
                                            value={DataChanges.Phone ||''}
                                            size="small"
                                            sx={{ width: '35%' }}
                                            onChange={handleInputChangePhone}
                                        />
                                    </div>
                                    <div className='Email'>
                                        <TextField
                                            label="Email"
                                            id="outlined-size-small"
                                            value={DataChanges.email ||''}
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
                                    className='mb-2 border mt-md-0 mt-2' 
                                    alt="User" 
                                    src={DataChanges.ImgUrl!== '' ? DataChanges.ImgUrl : user?.ImgAvt }
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
