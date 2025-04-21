/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../../../../../UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MemberTable = () => {
    const [members, setMembers] = useState([]);
    const { user } = useUser();

    const handleDelete = (email, name) => {
        toast.warning(
            <div className="text-center">
                <p className="font-bold mb-2">Confirm Deletion</p>
                <p>Are you sure you want to remove {name}?</p>
                <div className="flex justify-center gap-4 mt-4">
                    <button 
                        onClick={() => {
                            toast.dismiss();
                            deleteConfirmed(email);
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Delete
                    </button>
                    <button 
                        onClick={() => toast.dismiss()}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </div>,
             {
                position: "top-center",
                autoClose: false,
                closeButton: false,
                draggable: false,
                closeOnClick: false,
                className: 'w-full max-w-md bg-orange-100',
                style: {
                    zIndex: 2,
                }
             })
    };

    const deleteConfirmed = async (email) => {
        try {
            await axios.delete('http://localhost:3001/Members', {
                data: { 
                    email: user.email,
                    colleagueEmail: email 
                },
                withCredentials: true
            });
            setMembers(members.filter(member => member.EmailColleagues !== email));
            toast.success('Colleague removed successfully!');
        } catch (error) {
            console.error('Error deleting member:', error);
            toast.error('Failed to remove colleague');
        }
    };
    useEffect(() => {
        if (user) {
            const MemebrsGet = async () => {
                const res = await axios.get('http://localhost:3001/Members', {
                    params: { email: user.email },
                    withCredentials: true,
                });
                // console.log(res);
                setMembers(res.data.members);
            }
            MemebrsGet(); // Lấy dữ liệu ngay khi component được mount
        }

        return () => {
            setMembers([]);
        };
    }, [user]);

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <ToastContainer />
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Email</th>
                        <th scope="col" className="px-6 py-3">Job Title</th>
                        <th scope="col" className="px-6 py-3">Type</th>
                        <th scope="col" className="px-6 py-3"><span className="sr-only">Edit</span></th>
                    </tr>
                </thead>
                <tbody>
                    { members && members.length > 0 ? members.map((item, index) => (
                        <tr
                            key={index}
                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {item.UserName}
                            </th>
                            <td className="px-6 py-4 text-gray-900">{item.EmailColleagues}</td>
                            <td className="px-6 py-4 text-gray-900">{item.JobTitle}</td>
                            <td className="px-6 py-4 text-gray-900">{item.TypeJob}</td>
                            <td className="px-6 py-4 text-gray-900 text-right">
                                <a href="" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                                <button 
                                    onClick={() => handleDelete(item.EmailColleagues, item.UserName)}
                                    className="ml-5 font-medium text-red-600 dark:text-red-500 hover:underline"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </td>
                        </tr>
                    )) : null}
                </tbody>
            </table>
        </div>
    );
};

export default MemberTable;
