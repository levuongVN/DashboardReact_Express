import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../../../../UserContext';
import Navbar from '../../../../Navigation/navbar/NavigationBars';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Clock, LoaderCircle, Pencil, Save, Trash2, UserPlus, Users, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FormAddmembers from './TableMembers/FormAddmembers';
import { styled } from '@mui/material';

export default function TeamDetails() {
    // Remove URL parsing logic
    const { user } = useUser();
    const { TeamID } = useParams(); // Chú ý chữ D viết hoa    // State for editing
    const [isEditing, setIsEditing] = useState(false);
    const [originNameTeam, setOriginNameTeam] = useState('');
    const [teamName, setTeamName] = useState('...'); // Initialize with default value
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [isAddMembers, setIsAddMembers] = useState(false);
    const [members, setMembers] = useState([{
        TeamID: '',
        LeaderAvatar: '',
        LeaderName: '',
        Members: [{
            Img_avt: '',
            MemberEmail: '',
            MemberName: '',
            MemberAvatar: '',
            Role: '',
            JobTitle: '',
        }],
    }
    ]);
    const [dateCreated,setdateCreated] = useState();

    // fetch api
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:3001/get-team-details', {
                    params: { TeamID: TeamID }
                });
                // console.log(response.data);
                if (response.data.success) {
                    const teamData = response.data.data;
                    // console.log(teamData[0].Description);

                    setTeamName(teamData[0]?.TeamName || '...');
                    setOriginNameTeam(teamData[0]?.TeamName || '...');
                    setDescription(teamData[0]?.Description || 'loading...');
                    setdateCreated(teamData[0]?.DateCreated || '');

                    // Tạo một đối tượng để lưu trữ thông tin team
                    const teamInfo = {
                        TeamID: teamData[0]?.TeamID || '',
                        LeaderAvatar: teamData[0]?.LeaderAvatar || '',
                        LeaderName: teamData[0]?.LeaderName || '',
                        Members: teamData.map(member => ({
                            Img_avt: member.MemberAvatar || '',
                            MemberEmail: member.MemberEmail || '',
                            MemberName: member.MemberName || '',
                            MemberAvatar: member.MemberAvatar || '',
                            Role: member.MemberRole || '',
                            JobTitle: member.JobTitle || '',
                        }))
                    };

                    // Cập nhật state một lần duy nhất
                    setMembers([teamInfo]);
                }
            } catch (e) {
                console.error('Error fetching data:', e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();

    }, [TeamID, user])
    // console.log(members[0].Members)
    // Add these handlers
    const handleTeamNameChange = (e) => setTeamName(e.target.value);
    const handleDescriptionChange = (e) => setDescription(e.target.value);

    const handleRoleChange = (memberName, newRole) => {
        setMembers(prevMembers => {
            return prevMembers.map(team => ({
                ...team,
                Members: team.Members.map(member =>
                    member.MemberName === memberName
                        ? { ...member, Role: newRole }
                        : member
                )
            }));
        });
    };

    const [deletedMembers, setDeletedMembers] = useState([]);

    // Add this handler
    const handleDeleteMember = (memberEmail) => {
        setDeletedMembers(prev => [...prev, memberEmail]);
        setMembers(prevMembers => {
            return prevMembers.map(team => ({...team,Members: team.Members.filter(member => member.MemberEmail !== memberEmail)
            }));
        });
    };

    // Update handleSaveChanges
    const handleSaveChanges = async () => {
        try {
            setLoading(true);
            const teamData = {
                TeamID: members[0]?.TeamID,
                TeamName: teamName,
                Description: description,
                Members: members[0]?.Members.map(member => ({
                    MemberName: member.MemberName,
                    Role: member.Role
                })),
                DeletedMembers: deletedMembers
            };

            // Call the API to update team details
            const response = await axios.post('http://localhost:3001/update-team-details', teamData, {
                withCredentials: true
            });
            
            if (response.data.success) {
                toast.success('Team information updated successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
                setOriginNameTeam(teamName);
                setIsEditing(false);
                setDeletedMembers([]); // Reset deleted members after successful save
            } else {
                toast.error(`Update failed: ${response.data.message}`, {
                    position: "top-right",
                    autoClose: 4000,
                });
            }
        } catch (error) {
            toast.error('Network error updating team. Please try again.', {
                position: "top-right",
                autoClose: 4000,
            });
        } finally {
            setLoading(false);
        }
    };
    const handleDeleteTeam = async () => {
        toast.warn(
            <div>
                <p className="font-bold mb-2 text-white">Delete Team Confirmation</p>
                <p className='text-white'>Are you sure you want to delete this team?</p>
                <p className="text-sm text-gray-500 mt-1 text-white">This action cannot be undone</p>
                <div className="flex justify-center gap-4 mt-4">
                    <button 
                        onClick={() => {
                            toast.dismiss();
                            deleteTeamConfirmed();
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
                className: 'w-full max-w-md',
                style: {
                    backgroundColor: 'oklch(55.3% 0.195 38.402)',
                    color: 'oklch(55.3% 0.195 38.402)',
                },
                bodyClassName: 'p-4'
            }
        );
    };

    const deleteTeamConfirmed = async () => {
        try {
            setLoading(true);
            const response = await axios.delete('http://localhost:3001/delete-team', {
                data: { TeamID: TeamID },
                withCredentials: true
            });
            
            if (response.data.success) {
                toast.success('Team deleted successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
                // Redirect to team management page after deletion
                window.location.href = '/Team/Management';
            } else {
                toast.error(`Deletion failed: ${response.data.message}`, {
                    position: "top-right",
                    autoClose: 4000,
                });
            }
        } catch (error) {
            toast.error('Network error deleting team. Please try again.', {
                position: "top-right",
                autoClose: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    // there will keep default information that mean is not change the in4
    const handleCancel = () => {
        setIsEditing(false);
        // Reset to current values from state
        setTeamName(teamName);
        setDescription(description);
        setMembers(members);
        setLoading(false); // Đảm bảo luôn tắt loading dù thành công hay thất bại
    };

    // In JSX, update header display
    return (
        <>
            <Navbar />
            <ToastContainer />
            {isAddMembers && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    style={{ zIndex: 2 }}

                >
                    <div 
                        className='col-12 d-flex justify-content-center position-absolute mt-3' 
                        style={{ zIndex: 3 }}
                        onClick={(e) => e.stopPropagation()} // Prevent click propagation
                    >
                        <FormAddmembers avalaibleMembers={members} name={teamName} SetisAddMembers={setIsAddMembers} />
                    </div>
                </div>
            )}
            <div className='d-flex flex-column flex-md-row align-items-center m-3 ms-0 me-0 ms-md- me-md-3 bg-white shadow-sm rounded-lg p-3'>
                <div className='d-flex align-items-center col-12 col-md-9 mb-3 mb-md-0'>
                    <button
                        className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Back to teams list"
                    >
                        <Link to={'/Team/Management'}><ArrowLeft className="h-5 w-5 text-gray-500" />
                        </Link>
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                            {originNameTeam || '...'}
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500 mt-1 flex items-center">
                            <Clock className="h-3 md:h-4 w-3 md:w-4 mr-1" />
                            {dateCreated ? new Date(dateCreated).toISOString().split('T')[0] :'Loading...'}
                        </p>
                    </div>
                </div>
                <div className='col justify-content-end d-flex pe-3'>
                    {isEditing ? (
                        <div className="d-flex flex-column flex-sm-row gap-2 p-1">
                            <button
                                onClick={() => {
                                    handleSaveChanges();
                                }}
                                className="inline-flex justify-content-center items-center px-2 px-sm-3 px-md-4 py-1 py-sm-2 border border-transparent rounded-md shadow-sm text-xs text-sm-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors w-100">
                                <Save className="h-5 h-sm-5 h-md-5 w-5 w-sm-5 w-md-5 me-1 me-sm-2" />
                                Save Changes
                            </button>
                            <button
                                onClick={() => handleCancel()}
                                className="inline-flex justify-content-center items-center px-2 px-sm-3 px-md-4 py-1 py-sm-2 border border-gray-300 rounded-md shadow-sm text-xs text-sm-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors w-100"
                            >
                                <X className="h-3 h-sm-4 h-md-5 w-3 w-sm-4 w-md-5 me-1 me-sm-2" />
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-2 rounded-lg p-2 bg-white shadow-sm ">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex px-3 py-2 items-center border border-transparent rounded-md shadow-sm text-xs md:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors w-full md:w-auto"
                                >
                                    <Pencil className="h-3 md:h-4 w-3 md:w-4 mr-1 md:mr-2" />
                                    Edit Team
                                </button>
                                <button
                                    onClick={handleDeleteTeam}
                                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-xs md:text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors w-full md:w-auto"
                                >
                                    <Trash2 className="h-3 md:h-4 w-3 md:w-4 mr-1 md:mr-2" />
                                    Delete Team
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            {/* Main content - responsive */}
            <div className='d-flex flex-column flex-lg-row p-3 p-lg-5'>
                {/* Team Info - responsive */}
                <div className='col-12 col-lg-3 bg-white shadow-sm rounded-lg mb-4 mb-lg-0 me-lg-5'>
                    <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
                        <h2 className="text-lg font-medium text-indigo-800 flex items-center">
                            <ChevronRight className="h-5 w-5 mr-2" />
                            Team Information
                        </h2>
                    </div>
                    <div className="p-4 space-y-6">
                        {isEditing ? (
                            <>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Team Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    defaultValue={teamName || 'Team name here'}
                                    onChange={handleTeamNameChange}
                                />
                            </>
                        ) : (
                            <>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Team Name</label>
                                <p className="text-gray-900 font-medium text-base md:text-lg">{teamName || 'Team name here'}</p>
                            </>
                        )}
                    </div>
                    <div className='p-4'>
                        {isEditing ? (
                            <>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    rows="3"
                                    defaultValue={description}
                                    onChange={handleDescriptionChange}
                                />
                            </>
                        ) : (
                            <>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Description</label>
                                <p className="text-gray-700 text-xs md:text-sm">{description}</p>
                            </>
                        )}
                    </div>
                    <div className='d-flex align-items-center justify-content-center'>
                        <div className='d-flex align-items-center border-top col-10 pt-4 mb-4'>
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Users className="h-4 w-4 text-indigo-600" />
                            </div>
                            <span className="ml-2 text-sm text-gray-500">
                                team members
                            </span>
                        </div>
                    </div>
                </div>
                <div className='bg-white shadow-sm rounded-lg col-lg-8'>
                    <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex align-items-center">
                        <h2 className="text-lg col font-medium text-indigo-800 flex items-center">
                            <ChevronRight className="h-5 w-5 mr-2" />
                            Team Members
                        </h2>
                        {isEditing && (
                            <button
                                className="inline-flex items-center px-3 py-1.5 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                onClick={() => setIsAddMembers(true)}
                            >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Member
                            </button>
                        )}
                    </div>
                    <div className='p-4'>
                        {loading ? (
                            <div className="flex justify-center items-center p-8">
                                <LoaderCircle className="h-8 w-8 text-indigo-500 animate-spin" />
                                <span className="ml-2 text-gray-600">Loading team data...</span>
                            </div>
                        ) : (
                            /* Member items - responsive */
                            members.map((team, teamIndex) => (
                                <div key={team.TeamID || teamIndex}>
                                    {/* Leader */}
                                    {team.LeaderName && (
                                        <div className='flex flex-column flex-sm-row items-center border p-3 rounded-lg hover:bg-gray-50 transition-colors mb-3'>
                                            <div className='relative'>
                                                <img
                                                    src={team.LeaderAvatar}
                                                    alt={team.LeaderName}
                                                    className="h-12 w-12 rounded-full object-cover"
                                                />
                                                <div className="absolute -top-1 -right-1 bg-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                                    ★
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-sm font-medium text-gray-900">{team.LeaderName}</h3>
                                                <div className="flex items-center mt-1">
                                                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                                                        Team Leader
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Members */}
                                    {team.Members && team.Members.length > 0 ? (
                                        team.Members.map((member, memberIndex) => (
                                            <div key={memberIndex} className='flex flex-column flex-sm-row items-center border p-3 rounded-lg hover:bg-gray-50 transition-colors mb-3'>
                                                <div className='relative'>
                                                    <img
                                                        src={member.MemberAvatar || 'https://via.placeholder.com/40'}
                                                        alt={member.MemberName}
                                                        className="h-12 w-12 rounded-full object-cover"
                                                    />
                                                </div>
                                                <div className="ml-4 flex align-items-center justify-content-between w-100">
                                                    <div>
                                                        <h3 className="text-sm md:text-base font-medium text-gray-900">{member.MemberName}</h3>
                                                        <div className="flex items-center mt-1">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    defaultValue={member.Role}
                                                                    className="px-2.5 py-0.5 text-xs md:text-sm rounded-full font-medium bg-blue-100 text-blue-800 border border-blue-200"
                                                                    onChange={(e) => handleRoleChange(member.MemberID, e.target.value)}
                                                                />
                                                            ) : (
                                                                <>
                                                                    <span className='inline-flex items-center px-2.5 py-0.5 text-xs md:text-sm rounded-full font-medium bg-blue-100 text-blue-800'>
                                                                        {member.Role}
                                                                    </span>
                                                                    <span className="inline-flex ms-1 items-center px-2.5 py-0.5 text-xs md:text-sm rounded-full font-medium bg-blue-100 text-blue-800">
                                                                        {member.JobTitle}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {isEditing && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleDeleteMember(member.MemberEmail)}
                                                                className="text-red-500 hover:text-red-700 transition-colors"
                                                                title="Remove member"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center p-4 text-gray-500">
                                            <p>No team members found</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
