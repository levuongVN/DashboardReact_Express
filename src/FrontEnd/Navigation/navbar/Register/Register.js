// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from '@mui/material';
import './Register.css';
import debounce from 'lodash/debounce';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom'; 

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        "Confirm Password": '',
        terms: true
    });

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        terms: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const phoneToCountry = {
        '+84': 'Vietnam',
        '+1': 'USA',
        '+44': 'UK',
        '+86': 'China',
        '+81': 'Japan',
        '+82': 'South Korea',
        '+33': 'France'
    };

    const fetchPostData = async () => {
        try {
            // Xác định quốc gia từ mã điện thoại
            let country = '';
            for (let code in phoneToCountry) {
                if (formData.phone.startsWith(code)) {
                    country = phoneToCountry[code];
                    break;
                }
            }

            const response = await axios.post('http://localhost:3001/users', { ...formData, country });
            console.log('Success response:', response.data);
            if (response.data.success) {
                toast.success('Register success');
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    "Confirm Password": '',
                    terms: true
                });
                navigate('/Login');
            }
        } catch (error) {
            console.log('Full error object:', error);

            if (error.response && error.response.data && typeof error.response.data.message === 'string') {
                if (error.response.data.message.includes('Email')) {
                    setErrors(prev => ({
                        ...prev,
                        email: error.response.data.message
                    }));
                } else if (error.response.data.message.includes('Phone')) {
                    setErrors(prev => ({
                        ...prev,
                        phone: error.response.data.message
                    }));
                }
            } else {
                toast.error('Registration failed: ' + error.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    const Validation = (name, value) => {
        // Clear all previous errors first
        setErrors(prev => ({
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            terms: ''
        }));

        // Then set only the current field's error if needed
        if (name === 'name') {
            if (value.length < 3 && value.length !== 0) {
                setErrors(prev => ({
                    ...prev,
                    name: 'Name must be at least 3 characters long'
                }));
            } else if (value.length === 0) {
                setErrors(prev => ({
                    ...prev,
                    name: 'Name cannot be empty'
                }));
            }
        } else if (name === 'email' && value.length !== 0) {
            const regex = /^((\+?[1-9]\d{0,2}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/
            if (!regex.test(value)) {
                setErrors(prev => ({
                    ...prev,
                    email: 'Invalid email'
                }));
            } else if (value.length === 0) {
                setErrors(prev => ({
                    ...prev,
                    email: 'Email cannot be empty'
                }));
            }
        } else if (name === 'phone' && value.length !== 0) {
            const regex = /^(\+?[0-9]{1,3}[-. ]?)?[0-9]{10}$/
            // convertIdPhone to phoneRegions
            const phoneRegions = {
                '+84': '09',
                '+1': '',
                '+44': '07',
                '+86': '13',
                '+81': '08',
                '+82': '05',
                '+33': '06'
            }
            for(let [AreaCodePhone,LocalPhone]of Object.entries(phoneRegions)){
                if(value.startsWith(AreaCodePhone)){
                    value = LocalPhone + value.substring(AreaCodePhone.length);
                }
            }
            if (!regex.test(value)) {
                setErrors(prev => ({
                    ...prev,
                    phone: 'Invalid phone'
                }));
            } else if (value.length === 0) {
                setErrors(prev => ({
                    ...prev,
                    phone: 'Phone number cannot be empty'
                }));
            }
        } else if (name === 'password' && value.length !== 0) {
            const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+]).{8,}$/
            if (!regex.test(value)) {
                setErrors(prev => ({
                    ...prev,
                    password: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                }));
            } else if (value.length === 0) {
                setErrors(prev => ({
                    ...prev,
                    password: 'Password cannot be empty'
                }));
            }
        } else if (name === 'Confirm Password' && value.length !== 0) {
            if (value !== formData.password) {
                setErrors(prev => ({
                    ...prev,
                    confirmPassword: 'Confirm passwords do not match'
                }));
            } else if (value.length === 0) {
                setErrors(prev => ({
                    ...prev,
                    confirmPassword: 'Confirm password cannot be empty'
                }));
            } else if (!value) {
                setErrors(prev => ({
                    ...prev,
                    terms: 'You must agree to the terms and conditions'
                }));
            }
        }
    }

    const DebounceValue = debounce(Validation, 500);
    const handleInputChange = (e) => {
        const { name, value } = e.target; // đây là destructuring
        /*
        tương đướng với:
        const name = e.target.name;
        const value = e.target.value;
        */
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        DebounceValue(name, value);
    };

    const handleTermsChange = (e) => {
        setFormData(prev => ({
            ...prev,
            terms: e.target.checked
        }));
        Validation('terms', e.target.checked);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        
        // Kiểm tra các trường có lỗi
        let hasErrors = false;
        Object.keys(errors).forEach((key) => {
            if (errors[key]) {
                toast.error(errors[key]);
                hasErrors = true;
            }
        });

        // Kiểm tra các trường bị trống
        let hasEmptyFields = false;
        Object.keys(formData).forEach((key) => {
            if (formData[key] === '') {
                toast.error(`${key} cannot be empty`);
                hasEmptyFields = true;
            }
        });

        setTimeout(() => {
            setIsSubmitting(false);
        }, 4000);

        // Sử dụng biến cục bộ để kiểm tra form validity
        
        // Chỉ gọi fetchData nếu form hợp lệ
        if (!hasErrors && !hasEmptyFields) {
            fetchPostData();    
        }
    };
    return (
        <div className='d-flex justify-content-lg-center align-items-lg-center min-h-screen bg-img'>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 col-12 col-lg-6 bg-blur border-lg-rounded">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <svg className='mx-auto size-10' fill="none" height="48" viewBox="0 0 24 48" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m0 15.8981h17.3455l-17.061314 17.0613 2.756374 2.7564 17.06134-17.0613v17.3455h.1104l3.7877-3.7877v-15.9638l-4.2485-4.2485h-15.96596l-3.78553995 3.7855z" fill="#fff" /></svg>
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">
                        Create new account
                    </h2>
                    <p className="mt-2 text-center text-lg text-white">
                        Oh! This is the first time we meet
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm/6 font-medium text-white">
                                Full name
                            </label>
                            <div className="mt-2">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm/6 font-medium text-white">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm/6 font-medium text-white" >
                                Phone number
                            </label>
                            <div className="mt-2">
                                <input
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    autoComplete="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <label htmlFor="password" className="block text-sm/6 font-medium text-white">
                                        Password
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm/6 font-medium text-white">
                                        Confirm password
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="confirmPassword"
                                            name="Confirm Password"
                                            type="password"
                                            autoComplete="current-password"
                                            value={formData["Confirm Password"]}
                                            onChange={handleInputChange}
                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center">
                                <Checkbox
                                    defaultChecked={formData.terms}
                                    onChange={handleTermsChange}
                                    name="terms"
                                    id="terms"
                                    sx={{
                                        color: "#14dfb4",
                                        '&.Mui-checked': {
                                            color: "#14dfb4",
                                        },
                                        '&.Mui-checked:hover': {
                                            color: "#14dfb4",
                                        },
                                    }}
                                />
                                <label htmlFor='terms' className="block text-sm/6 font-medium text-white">
                                    I accept the <Link className='terms-conditions' to={'/Terms'}>terms and conditions</Link>
                                </label>
                            </div>
                        </div>
                        <div>
                            <button
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                onClick={handleSubmit}
                            >
                                {isSubmitting ? 'Registering...' : 'Register'}
                            </button>
                        </div>
                        <div>
                            <p className="text-center text-sm/6 text-white" >
                                Already have an account?{' '}
                                <Link to={'/Login'} className="font-medium text-indigo-600 hover:text-indigo-500 login">
                                    Login
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                theme="colored"
                limit={6}
            />
        </div>
    )
}
