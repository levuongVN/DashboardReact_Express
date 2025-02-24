/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Link } from "react-router-dom";
import { useState } from "react";

import Hire from '../hireMember/hire'
import axios from "axios";
import { useUser } from "../../../../UserContext";
function createData(Person, Emails, Country, Start_Date, Type, Job_Title, Status) {
    // console.log(Status)
    return { Person, Emails, Country, Start_Date, Type, Job_Title, Status };
}
const rowsMember = [];

export default function Display() {
    const { user, setUser } = useUser();
    const [dataColleagues, setDataColleagues] = useState([]);
    const [count, setCount] = useState(0);
    const [hireOpen, setHireOpen] = useState(null);
    const [statusWork, setStatusWork] = useState('Active');
    const [CountStt, setCountStt] = useState([]);
    const [CountAll, setCountAll] = useState(0);
    // ... existing code ...
    async function fetchColleagues(Stt) {
        try {
            if (user && user.email) {
                const res = await axios.get(
                    'http://localhost:3001/colleagues',
                    {
                        params: {
                            email: user.email,
                            stt: Stt,
                        },
                        withCredentials: true,
                    }
                );
                const data = res.data;
                // console.log(data)
                if (data.success) {
                    setCount(data.colleagues.length);
                    const RowsFetched = data.colleagues.map(item =>
                        createData(item.UserName, item.EmailColleagues, item.CountryName, item.DateStart, item.TypeJob, item.JobTitle, item.StatusWork)
                    );
                    setDataColleagues(RowsFetched);

                    // Sửa phần xử lý CountStt
                    setCountStt(data.countStt.map(e => ({
                        CountGr: e.CountGr,
                        StatusWork: e.StatusWork
                    })));
                    // console.log(data.countAll[0].CountAll)
                    setCountAll(data.countAll[0].CountAll);
                } else {
                    console.error("Error fetching colleagues:", data.message);
                }
            }
        } catch (error) {
            console.error("Error fetching colleagues:", error);
        }
    }
    // ... existing code ...
    useEffect(() => {
        fetchColleagues(statusWork);
    }, [user]);
    // ... rest of the component code ...
    // console.log(CountAll)
    return (
        <div style={{ borderTop: "1px solid white", paddingTop: "1%" }}>
            <div className={hireOpen ? "position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50" : "d-none"} style={{ zIndex: "2" }}>
                
            </div>
            <div className="d-block d-md-flex col" style={{ color: "white" }}>
                <div className="d-flex col">
                    <ul className="d-flex">
                        <li className=" d-flex me-5">
                            <Link
                                className={`d-flex ${statusWork === 'Active' ? 'text-purple-500 text-decoration-underline' : 'text-gray-300 text-decoration-none'}`}
                                onClick={() => {
                                    setStatusWork('Active');
                                    fetchColleagues('Active');
                                }}
                            >
                                <p className="me-1">Active</p>
                            </Link>
                            <p className="bg-purple-700 rounded" style={{ width: '1.5rem', height: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
                                {CountStt[0]?.CountGr || 0}
                            </p>
                        </li>
                        <li className=" d-flex me-5">
                            <Link onClick={() => {
                                setStatusWork('Terminated');
                                fetchColleagues('Terminated');
                            }}
                                className={`d-flex ${statusWork === 'Terminated' ? 'text-purple-500 text-decoration-underline' : 'text-gray-300 text-decoration-none'}`}>
                                <p className="me-1">Terminated</p>
                            </Link>
                            <p className="bg-purple-700 rounded" style={{ width: '1.5rem', height: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
                                {CountStt[1]?.CountGr || 0}
                            </p>
                        </li>
                        <li className=" d-flex me-0 me-md-5">
                            <Link
                                onClick={
                                    () => {
                                        setStatusWork('All')
                                        fetchColleagues('All')
                                    }
                                }
                                className={`d-flex ${statusWork === 'All' ? 'text-purple-500 text-decoration-underline' : 'text-gray-300 text-decoration-none'}`}>
                                <p className="me-1">All</p>
                            </Link>
                            <p className="bg-purple-700 rounded" style={{ width: '1.5rem', height: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
                                {CountAll || 0}
                            </p>                        
                        </li>
                    </ul>
                </div>
                <div>
                    <button type="button" className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 rounded-lg text-sm px-5 py-1 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
                        onClick={() => setHireOpen(true)}>New hire +
                    </button>
                </div>
            </div>
            <div className="bg-white mb-1">
                <TableContainer component={Paper} className="overflow-x-auto">
                    <Table aria-label="responsive table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Person</TableCell>
                                <TableCell align="center">Emails</TableCell>
                                <TableCell align="center">Country</TableCell>
                                <TableCell align="center">Start Date</TableCell>
                                <TableCell align="center">Type</TableCell>
                                <TableCell align="center">Job Title</TableCell>
                                <TableCell align="center d-none d-md-block">Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dataColleagues.map(e => (
                                <TableRow key={e.Person}>
                                    <TableCell component="th" scope="row">
                                        {e.Person}
                                    </TableCell>
                                    <TableCell align="center">{e.Emails}</TableCell>
                                    <TableCell align="center">{e.Country}</TableCell>
                                    <TableCell align="center">{e.Start_Date.slice(0, 10)}</TableCell>
                                    <TableCell align="center">{e.Type}</TableCell>
                                    <TableCell align="center">{e.Job_Title}</TableCell>
                                    <TableCell align="center d-none d-md-block">{e.Status}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
            <div className="pagination d-flex justify-content-center ">
                <ul className="d-flex">
                    <li className="page-item disabled">
                        <Link className="page-link" to="#" tabIndex="-1">Previous</Link>
                    </li>
                    <li className="page-item active"><Link className="page-link" to="#">1</Link></li>
                    <li className="page-item">
                        <Link className="page-link" to="#">2</Link>
                    </li>
                    <li className="page-item">
                        <Link className="page-link" to="#">3</Link>
                    </li>
                    <li className="page-item">
                        <Link className="page-link" to="#">Next</Link>
                    </li>
                </ul>
            </div>
            <div className={hireOpen ? "col-12 position-absolute top-10 md:top-1 start-0 d-flex justify-content-center" : "d-none"} style={{ zIndex: "3" }}>
                <Hire closeStt={setHireOpen} />
            </div>
        </div>
    )
}