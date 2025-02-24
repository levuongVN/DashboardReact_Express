import { useState, useEffect } from 'react';
import { UserPlus, Mail, Briefcase, Shield, FolderPlus } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../../../../UserContext';

export default function InviteColleague({ closeStt }) {
    // eslint-disable-next-line no-unused-vars
    const { user, setUser } = useUser();
    const [formData, setFormData] = useState({
        email: '',
        role: '',
        jobType: '',
        jobTitles: '',
        projectName: '',
        notes: ''
    });
    const [error, setError] = useState('');
    const [ws, setWs] = useState(null);

    // Khởi tạo WebSocket connection
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:3001');
        
        socket.onopen = () => {
            // console.log('WebSocket Connected');
            // Đăng ký user online
            socket.send(JSON.stringify({ 
                type: "online", 
                email: user?.email 
            }));
        };

        setWs(socket);

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, [user?.email]);

    const roles = [
        { id: 'admin', label: 'Administrator' },
        { id: 'editor', label: 'Editor' },
        { id: 'viewer', label: 'Viewer' }
    ];

    const jobTitles = [
        { id: 'developer', label: 'Developer' },
        { id: 'designer', label: 'Designer' },
        { id: 'manager', label: 'Manager' },
        { id: 'marketing', label: 'Marketing' }
    ];
    const jobTypes = [
        { id: 'PartTime', label: 'Part Time' },
        { id: 'FullTime', label: 'Full Time' },
    ]
    const validateEmail = (email) => {
        return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    };

    const handleClose = (e) => {
        e.preventDefault();
        setError('');
        setFormData({  // Sửa từ setFormData('') thành object rỗng
            email: '',
            role: '',
            jobType: '',
            jobTitles: '',
            projectName: '',
            notes: ''
        });
        closeStt(false);
    }
    const fetchInvites = async ()=>{
       const PostInvite = await axios.post('http://localhost:3001/invites',
            {
                email: formData.email,
                emailIsInvited: user.email,
                role: formData.role,
                jobType: formData.jobType,
                jobTitles: formData.jobTitles,
                notes: formData.notes,
                projectName: formData.projectName,
                
            },
            {
                withCredentials: true
            }
        )
        return PostInvite.data
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.projectName.trim()) {
            setError('Please enter project name');
            return;
        }
        if (!validateEmail(formData.email)) {
            setError('Invalid email');
            return;
        }
        if (!formData.role) {
            setError('Please select access role');
            return;
        }
        if (!formData.jobTitles) {
            setError('Please select job titles');
            return;
        }
        if (!formData.jobType) {
            setError('Please select job type');
            return;
        }

        try {
            const success = await fetchInvites();
            
            if (success.success) {
                // Gửi thông báo qua WebSocket khi invite thành công
                if (ws) {
                    ws.send(JSON.stringify({
                        type: "invite",
                        to: formData.email,
                        from: user.email,
                        projectName: formData.projectName,
                        role: formData.role,
                        jobType: formData.jobType,
                        jobTitles: formData.jobTitles
                    }));
                }

                setError('');
                setFormData({
                    email: '',
                    role: '',
                    jobType: '',
                    jobTitles: '',
                    projectName: '',
                    notes: ''
                });
                closeStt(false);
            } else {
                setError(success.message);
            }
        } catch (err) {
            setError('Failed to send invitation');
            console.error(err);
        }
    };
    return (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <div className="flex col">
                <div className='d-flex items-center gap-2 col'>
                    <UserPlus className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-800 mt-2">Invite coworker</h2>
                </div>
                <div className='btnCls'>
                    <button onClick={handleClose} type="button" className="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>

                        <span className="sr-only">Icon Close</span>
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Name
                    </label>
                    <div className="relative d-flex">
                        <FolderPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={formData.projectName}
                            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                            className="pl-12 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter project name"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <div className="relative d-flex">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="pl-12 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="email@company.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Decentralization
                    </label>
                    <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="pl-12 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select role</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Titles
                    </label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={formData.jobTitles}
                            onChange={(e) => setFormData({ ...formData, jobTitles: e.target.value })}
                            className="pl-12 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select job</option>
                            {jobTitles.map(job => (
                                <option key={job.id} value={job.id}>
                                    {job.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Types
                    </label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={formData.jobType}
                            onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                            className="pl-12 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select Time</option>
                            {jobTypes.map(job => (
                                <option key={job.id} value={job.id}>
                                    {job.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                    </label>
                    <div className="relative">
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="pl-12 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                            placeholder="Add notes about project and role..."
                        />
                    </div>
                </div>
                {error && (
                    <div className="text-red-500 text-sm mt-2">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    <UserPlus className="w-5 h-5" />
                    Invite
                </button>
            </form>
        </div>
    );
}
