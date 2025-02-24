/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../../../../../UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
const MemberTable = () => {
    const [members, setMembers] = useState([]);
    const { user } = useUser();
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
                    {members.length > 0 ? members.map((item, index) => (
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
                                <a href="" className="font-medium text-blue-600 dark:text-blue-500 hover:underline ">Edit</a>
                                <a href="" className="ml-5 font-medium text-red-600 dark:text-red-500 hover:underline">
                                    <FontAwesomeIcon icon={faTrash} />
                                </a>
                            </td>
                        </tr>
                    )) : null}
                </tbody>
            </table>
        </div>
    );
};

export default MemberTable;
