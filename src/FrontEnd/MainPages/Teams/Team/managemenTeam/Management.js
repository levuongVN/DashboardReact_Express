import { UserX } from 'lucide-react';
import TreeContent from '../../TreeContent';
import Navbar from '../../../../Navigation/navbar/NavigationBars';
import MemberTable from './TableMembers/Member';
import { useState } from 'react';
import Hire from '../hireMember/hire'
import MakeGroup from '../managemenTeam/MakeGroup'
import  FormGroup  from '../managemenTeam/FormGroup';

const TeamMember = ({ name, position, imageUrl }) => {
    const [hireOpen, setHireOpen] = useState(null);
    const [makeGroupOpen, setMakeGroupOpen] = useState(null);
    return (
        <div className='bg-dark' style={{ width: "100%", height: "100vh" }}>
            <div className={hireOpen || makeGroupOpen ? "position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50" : "d-none"} style={{ zIndex: "2" }}></div>
            <Navbar />
            <div className='d-block d-md-flex col container-fluid'>
                <TreeContent />
                <div className='col'>
                    <div className='d-flex'>
                        <div className='header col d-block mt-2 mt-md-0' style={{ color: 'white' }}>
                            <div className='col'>
                                <h5>Management</h5>
                                <p className='fw-lighter'>Manage your team members and their roles effectively</p>
                                <button type="button" className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 rounded-lg text-sm px-5 py-1 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
                                    onClick={() => setHireOpen(true)}>New hire +
                                </button>
                                <button type="button" className="ms-4 focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 rounded-lg text-sm px-5 py-1 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
                                    onClick={()=> setMakeGroupOpen(true)}>New Team +
                                </button>
                            </div>
                            <div className='col'>
                                <MemberTable />
                            </div>
                            <div className='mt-3'>
                                <MakeGroup />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={hireOpen ? "col-12 position-absolute top-10 md:top-1 start-0 d-flex justify-content-center" : "d-none"} style={{ zIndex: "3" }}>
                <Hire closeStt={setHireOpen} />
            </div>
            <div className={makeGroupOpen? "col-12 position-absolute top-40 md:top-1 start-0 d-flex justify-content-center" : "d-none"} style={{ zIndex: "3" }}>
                <FormGroup closeStt={setMakeGroupOpen} />
            </div>
        </div>
    );
};

export default TeamMember