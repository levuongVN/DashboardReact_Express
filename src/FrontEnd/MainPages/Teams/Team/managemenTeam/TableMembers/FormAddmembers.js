import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../../../../../UserContext';
import Avatar from '@mui/material/Avatar';
import { Check, Filter, Mail, Search, Send, UserPlus, X } from 'lucide-react';
import { useWebSocket } from '../../../../../WebSocketContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function FormAddmembers({ avalaibleMembers, name, SetisAddMembers }) {
    // console.log(avalaibleMembers)
    const { user } = useUser();
    const [searchMember, setSearchMember] = useState('');
    const [mockColleagues, setMockColleagues] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [InvitationMessage, setInvitationMessage] = useState('I would like to invite you to join our team. Looking forward to working together!');
    const { sendMessage } = useWebSocket();

    useEffect(() => {
        const fetchColleagues = async () => {
            try {
                const response = await axios.get('http://localhost:3001/Members', {
                    params: { email: user.email },
                    withCredentials: true
                });

                // Filter out existing team members
                // Change from MemberEmail to Email to match the API response structure
                const existingMemberEmails = avalaibleMembers[0]?.Members.map(m => m.MemberEmail) || [];
                const filteredColleagues = response.data.members.filter(member =>
                    !existingMemberEmails.includes(member.EmailColleagues)
                );
                // console.log(filteredColleagues)
                // console.log(response.data.members)
                setMockColleagues(filteredColleagues);
            } catch (error) {
                console.error('Error fetching colleagues:', error);
            }
        }
        fetchColleagues();
        return () => {
            setSelectedMembers([]);
        };
    }, [user, avalaibleMembers]);
    // console.log(mockColleagues)
    const handleSearch = (e) => {
        setSearchMember(e.target.value.toLowerCase());
    };

    // Add this filtered colleagues function
    const filteredColleagues = mockColleagues.filter(member => {
        if (!searchMember) return true;

        return (
            member.UserName?.toLowerCase().includes(searchMember) ||
            member.EmailColleagues?.toLowerCase().includes(searchMember) ||
            member.JobTitle?.toLowerCase().includes(searchMember)
        );
    });

    const toggleMemberSelection = (member) => {
        setSelectedMembers(prev => {
            const isSelected = prev.some(m => m.EmailColleagues === member.EmailColleagues);
            return isSelected
                ? prev.filter(m => m.EmailColleagues !== member.EmailColleagues)
                : [...prev, { ...member, role: 'member' }]; // Add role property
        });
    };

    const handleRoleChange = (email, newRole) => {
        setSelectedMembers(prev =>
            prev.map(member =>
                member.EmailColleagues === email
                    ? { ...member, role: newRole }
                    : member
            )
        );
    };
    const toggleSelectAll = () => {
        setSelectedMembers(selectedMembers.length === mockColleagues.length ? [] : mockColleagues);
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Kiểm tra thông tin đầu vào
        if (selectedMembers.length === 0) {
            toast.error('Vui lòng chọn ít nhất một thành viên', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }
    
        if (!InvitationMessage.trim()) {
            toast.error('Vui lòng nhập nội dung lời mời', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }
    
        // Create WebSocket message matching formgroup.js structure
        const message = {
            type: 'CreateTeam',
            team: {
                from: user?.email,
                name: name,
                info: InvitationMessage,
                members: selectedMembers.map(member => ({
                    id: member.EmailColleagues,
                    role: member.role || 'member' // Ensure role has a default
                })),
            },
        };
    
        sendMessage(JSON.stringify(message));
        SetisAddMembers(false);
    
        try {
            // Send invites one by one
                await axios.post('http://localhost:3001/Teams-invite', {
                    TeamName: name,
                    SenderEmail: user?.email,
                    ReceiverEmail: selectedMembers,
                    Status: 'pending',
                    Role: selectedMembers
                }, {
                    withCredentials: true
                });
            toast.success('Gửi lời mời thành công!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        } catch (error) {
            console.error('Error sending invitation:', error);
            toast.error('Có lỗi xảy ra khi gửi lời mời', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        } finally {
            SetisAddMembers(false);
        }
    };

    const handleCancel = () => {
        SetisAddMembers(false);
    };

    return (
        <div className='bg-white p-6 rounded-lg shadow-md col-5 '>
            <h2 className="text-xl font-semibold mb-4">Add Team Member</h2>
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        onChange={handleSearch}
                        className="pl-10 block w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search colleagues by name or email..."
                    />
                </div>
                <div>
                    <div className='flex align-items-center mt-4'>
                        <h2 className="text-xl col font-semibold ">Available Colleagues</h2>
                        <div className='col flex justify-content-end'>
                            <button
                                type="button"
                                onClick={toggleSelectAll}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Select All
                            </button>
                        </div>
                    </div>
                    {/* // In the return statement, update the mockColleagues.map to filteredColleagues.map */}
                    <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                        {filteredColleagues.map((member, index) => (
                            <div
                                key={index}
                                className="flex items-center p-2 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                            >
                                <input
                                    type="checkbox"
                                    id={`colleague-${index}`}
                                    checked={selectedMembers.some(m => m.EmailColleagues === member.EmailColleagues)}
                                    onChange={() => toggleMemberSelection(member)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label
                                    htmlFor={`colleague-${index}`}
                                    className="ml-3 flex items-center cursor-pointer flex-1"
                                >
                                    <div className="flex-shrink-0">
                                        <Avatar alt={member.UserName} src={member.Img_avt} />
                                    </div>

                                    <div className="ml-3 flex-1">
                                        <div className="font-medium">{member.UserName}</div>
                                        <div className="text-sm text-gray-500 flex items-center">
                                            <Mail size={12} className="mr-1" />
                                            {member.EmailColleagues}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {member.JobTitle}
                                    </div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Display option role of members was chosen */}
                {selectedMembers.map((member, index) => (
                    <>
                        <div className='flex align-items-center mt-4'>
                            <h2 className="text-xl col font-semibold ">Choose Role</h2>
                        </div>
                        <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                            <div
                                key={index}
                                className="flex items-center p-2 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                            >
                                <div className="flex-shrink-0">
                                    <Avatar alt={member.UserName} src={member.Img_avt} />
                                </div>
                                <div className="ml-3 flex-1">
                                    <div className="font-medium">{member.UserName}</div>
                                    <div className="text-sm text-gray-500 flex items-center">
                                        <Mail size={12} className="mr-1" />
                                        {member.EmailColleagues}
                                    </div>
                                </div>
                                {/* Option role */}
                                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    <select
                                        value={member.role}
                                        onChange={(e) => handleRoleChange(member.EmailColleagues, e.target.value)}
                                        className="text-xs text-gray-500 bg-gray-100 px-4 py-1 rounded"
                                    >
                                        <option value="member">Member</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </>
                ))}
                <div className="mt-4">
                    <label htmlFor="invitationMessage" className="block text-sm font-medium text-gray-700">
                        Invitation Message
                    </label>
                    <textarea
                        id="invitationMessage"
                        value={InvitationMessage}
                        onChange={(e) => setInvitationMessage(e.target.value)}
                        rows={4}
                        className="mt-1 block w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Type your invitation message here..."
                    />
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={handleCancel} // Changed from object literal to function reference
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Send size={16} className="mr-2 inline" />
                        Send Invites
                    </button>
                </div>
            </form>
        </div>
    )
}
