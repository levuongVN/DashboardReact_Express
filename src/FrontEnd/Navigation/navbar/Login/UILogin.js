import React from 'react';
import { useState } from 'react';
import './UILogin.css';
import { Link, useNavigate } from 'react-router-dom';
import { Button, TextField } from "@mui/material";
import axios from 'axios';
import debounce from 'lodash/debounce'; // Thu vien co san ham debounce

// handleLogin()
export default function UILogin({UserName}) {
    const navigate = useNavigate();
    // eslint-disable-next-line no-unused-vars
    const [data_email_name, setdata_email_name] = useState('');
    const [data_password, setData_password] = useState('');
    const [errorMessageEmailPhone, seterrorMessageEmailPhone] = useState('');
    const [errorMessagePassword, seterrorMessagePassword] = useState('');

    // Hàm chuyển đổi số điện thoại quốc tế về số local
    const convertToLocalPhone = (phone) => {
        if (!phone) return '';  // Thêm kiểm tra phone tồn tại
        
        const countryPrefixes = {
            '+84': '0',    // Vietnam
            '+1': '',      // US/Canada
            '+44': '0',    // UK
            '+86': '0',    // China
            '+81': '0',    // Japan
            '+82': '0',    // South Korea
            '+33': '0',    // France
            '+49': '0',    // Germany
            '+61': '0',    // Australia
        };

        // Kiểm tra và chuyển đổi
        for (let [prefix, localPrefix] of Object.entries(countryPrefixes)) {
            if (phone.startsWith(prefix)) {
                return localPrefix + phone.substring(prefix.length);
            }
        }
        
        return phone;
    };

    const handleLogin = async () => {
        try {
            if (!data_email_name || !data_password) {
                seterrorMessageEmailPhone('Email or phone cannot be empty');
                seterrorMessagePassword('Password cannot be empty');
                return;
            }
            console.log(convertToLocalPhone(data_email_name));
            // Gọi API login
            const response = await axios.post('http://localhost:3001/login', {
                email: convertToLocalPhone(data_email_name),
                password: data_password
            }, {
                withCredentials: true // Quan trọng để nhận cookies từ server
            });

            if (response.data.success ===true) {
                UserName(response.data.user.name);
                seterrorMessageEmailPhone('');
                seterrorMessagePassword('');
                navigate('/');
            }
        } catch (error) {
            console.error('Login error:', error);
            seterrorMessageEmailPhone('Email/Phone or password is incorrect');
            seterrorMessagePassword('Email/Phone or password is incorrect');
        }
    };
    const ValidationEmailPhone = (value) => {
        // Regex cho email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        // Regex cho số điện thoại quốc tế
        const phoneRegex = /^\+?(?:[0-9] ?){6,14}[0-9]$/;
        
        if (emailRegex.test(value) || phoneRegex.test(value)) {
            seterrorMessageEmailPhone('');
            return true;
        } else {
            seterrorMessageEmailPhone('Invalid email or phone');
            return false;
        }
    }
    const ValidationPasswords = (value) => {
        if (value.length < 8) {
            seterrorMessagePassword('Password must be at least 8 characters long');
            return false;
        } else {
            seterrorMessagePassword('');
            return true;
        }
    }
    const DebounceInputEmailPhone = debounce(ValidationEmailPhone, 500)
    const hanldeDataNameEmail = (e) => {
        e.preventDefault();
        let value = e.target.value;
        setdata_email_name(value);
        DebounceInputEmailPhone(value);
        // console.log(value)
    }
    const DebounceInputPasswords = debounce(ValidationPasswords, 500);
    const handleInputPasswords = (e) => {
        e.preventDefault();
        let value = e.target.value;
        setData_password(value);
        DebounceInputPasswords(value);
        // console.log(value)
    }
    return (
        <div className='container-fluid bg-primary d-flex justify-content-center align-items-center ' style={{ height: "100vh" }}>
            <div className='FormLogin border bg-transparent p-4'>
                <h1 className='text-center text-white'>Do It For The Future!!!</h1>
                <form className='d-flex flex-column'>
                    <TextField
                        label="Email or Phone"
                        variant="standard"
                        className='mb-3'
                        onChange={hanldeDataNameEmail}
                        error={!!errorMessageEmailPhone} // Chuyển đổi giá trị thành kiểu boolean, khi rỗng thì sẽ là null hoặc undefined
                        helperText={errorMessageEmailPhone}
                        sx={{
                            "& .MuiInput-underline:before": {
                                borderBottomColor: "gray", // Underline màu trắng
                            },
                            "& .MuiInput-underline:hover:before": {
                                borderBottomWidth: "1px",
                                borderBottomColor: "white", // Underline khi hover
                            },
                            "& .MuiInput-underline:after": {
                                borderBottomColor: "#3fbdef", // Underline khi focus
                            },
                            "& .MuiInputLabel-root": {
                                color: "white", // Màu label
                            },
                            "& .MuiInputBase-input": {
                                color: "white", // Màu chữ trong input
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                                color: "aqua", // Màu label khi focused
                            }
                        }}
                    />
                    <TextField
                        id="standard-basic" className='col' label="Password" variant="standard"
                        onChange={handleInputPasswords}
                        error={!!errorMessagePassword}
                        helperText={errorMessagePassword}
                        sx={{
                            "& .MuiInput-underline:before": {
                                borderBottomColor: "gray", // Underline màu trắng
                            },
                            "& .MuiInput-underline:hover:before": {
                                borderBottomWidth: "1px",
                                borderBottomColor: "white", // Underline khi hover
                            },
                            "& .MuiInput-underline:after": {
                                borderBottomColor: "#3fbdef", // Underline khi focus
                            },
                            "& .MuiInputLabel-root": {
                                color: "white", // Màu label
                            },
                            "& .MuiInputBase-input": {
                                color: "white", // Màu chữ trong input
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                                color: "aqua", // Màu label focused
                            }
                        }}
                    />
                    <div className='col-12 mt-3 mb-3 d-flex justify-content-end'>
                        <Link to='/' className='text-decoration-none text-light'>Forgot Password?</Link>
                    </div>
                    <Button variant="contained" onClick={handleLogin}>Login</Button>
                    <div className='col-12 mt-3 d-flex justify-content-center text-light'>
                        Don't have an account? <Link to='/Register' className="ms-1 text-lime-400">Sign up</Link>
                    </div>
                    <i className='text-light d-block mt-0 mb-3 text-center col'>or</i>
                    {/* Another login */}
                    <div className='row gy-3 AnotherLogin'>
                        <div className='col'>
                            <Button variant="outlined" className='p-2 text-light bgFaceBookLogin'>
                                <svg xmlns="http://www.w3.org/2000/svg" className='me-1' x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
                                    <linearGradient id="Ld6sqrtcxMyckEl6xeDdMa_uLWV5A9vXIPu_gr1" x1="9.993" x2="40.615" y1="9.993" y2="40.615" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2aa4f4"></stop><stop offset="1" stop-color="#007ad9"></stop></linearGradient><path fill="url(#Ld6sqrtcxMyckEl6xeDdMa_uLWV5A9vXIPu_gr1)" d="M24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20S35.046,4,24,4z"></path><path fill="#fff" d="M26.707,29.301h5.176l0.813-5.258h-5.989v-2.874c0-2.184,0.714-4.121,2.757-4.121h3.283V12.46 c-0.577-0.078-1.797-0.248-4.102-0.248c-4.814,0-7.636,2.542-7.636,8.334v3.498H16.06v5.258h4.948v14.452 C21.988,43.9,22.981,44,24,44c0.921,0,1.82-0.084,2.707-0.204V29.301z"></path>
                                </svg> Facebook
                            </Button>
                        </div>
                        <div className='col'>
                            <Button variant="outlined" className='p-2 text-dark bgGoogleLogin'>
                                <svg xmlns="http://www.w3.org/2000/svg" className='me-1' x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
                                    <path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                </svg>Google
                            </Button>
                        </div>
                        <div className='col'>
                            <Button variant="outlined" className='p-2 text-dark bg-light'>
                                <svg xmlns="http://www.w3.org/2000/svg" className='me-1' x="0px" y="0px" width="20" height="20" viewBox="0 0 50 50">
                                    <path d="M17.791,46.836C18.502,46.53,19,45.823,19,45v-5.4c0-0.197,0.016-0.402,0.041-0.61C19.027,38.994,19.014,38.997,19,39 c0,0-3,0-3.6,0c-1.5,0-2.8-0.6-3.4-1.8c-0.7-1.3-1-3.5-2.8-4.7C8.9,32.3,9.1,32,9.7,32c0.6,0.1,1.9,0.9,2.7,2c0.9,1.1,1.8,2,3.4,2 c2.487,0,3.82-0.125,4.622-0.555C21.356,34.056,22.649,33,24,33v-0.025c-5.668-0.182-9.289-2.066-10.975-4.975 c-3.665,0.042-6.856,0.405-8.677,0.707c-0.058-0.327-0.108-0.656-0.151-0.987c1.797-0.296,4.843-0.647,8.345-0.714 c-0.112-0.276-0.209-0.559-0.291-0.849c-3.511-0.178-6.541-0.039-8.187,0.097c-0.02-0.332-0.047-0.663-0.051-0.999 c1.649-0.135,4.597-0.27,8.018-0.111c-0.079-0.5-0.13-1.011-0.13-1.543c0-1.7,0.6-3.5,1.7-5c-0.5-1.7-1.2-5.3,0.2-6.6 c2.7,0,4.6,1.3,5.5,2.1C21,13.4,22.9,13,25,13s4,0.4,5.6,1.1c0.9-0.8,2.8-2.1,5.5-2.1c1.5,1.4,0.7,5,0.2,6.6c1.1,1.5,1.7,3.2,1.6,5 c0,0.484-0.045,0.951-0.11,1.409c3.499-0.172,6.527-0.034,8.204,0.102c-0.002,0.337-0.033,0.666-0.051,0.999 c-1.671-0.138-4.775-0.28-8.359-0.089c-0.089,0.336-0.197,0.663-0.325,0.98c3.546,0.046,6.665,0.389,8.548,0.689 c-0.043,0.332-0.093,0.661-0.151,0.987c-1.912-0.306-5.171-0.664-8.879-0.682C35.112,30.873,31.557,32.75,26,32.969V33 c2.6,0,5,3.9,5,6.6V45c0,0.823,0.498,1.53,1.209,1.836C41.37,43.804,48,35.164,48,25C48,12.318,37.683,2,25,2S2,12.318,2,25 C2,35.164,8.63,43.804,17.791,46.836z"></path>
                                </svg>
                                Github
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}