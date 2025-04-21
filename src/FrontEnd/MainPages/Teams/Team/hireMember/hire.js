import { useState, useEffect } from 'react';
import { UserPlus, Mail, Briefcase, Shield, FolderPlus } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../../../../UserContext';
import { useWebSocket } from '../../../../WebSocketContext';
// Add this import at the top
import { useProjects } from '../../../../ProjectsContext';

// Modify the component to use projects from context
export default function InviteColleague({ closeStt }) {
    const { user } = useUser();
    const { projects } = useProjects(); // Get projects from context
    const [selectedProject, setSelectedProject] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        role: '',
        jobType: '',
        jobTitles: '',
        projectId: '',
        notes: ''
    });
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { ws, sendMessage } = useWebSocket();
    // Fix the projects filtering logic
    const filteredProjects = projects && typeof projects === 'object'
        ? Object.values(projects).filter(project => 
            project?.ProjectName?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        :[];
        
    // Update the useEffect to debug projects type
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
    const fetchInvites = async ()=> {
       const PostInvite = await axios.post('http://localhost:3001/invites',
            {
                email: formData.email,
                emailInvited: user.email,
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
        if (!formData.projectId) { // Changed validation from projectName to projectId
            setError('Please select a project');
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
                sendMessage(JSON.stringify({
                    type: 'invite',
                    EmailPersonInvited: user.email,
                    EmailPersonInvite: formData.email,
                    ProjectName: formData.projectName,
                    notes: formData.notes,
                    role: formData.role,
                    jobTitles: formData.jobTitles,
                    jobType: formData.jobType,
                }));
                
                // Thông báo kết quả đăng ký thành công
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
                // setError(success.message);
                console.log(false)
            }
        } catch (err) {
            setError('Failed to send invitation');
            console.error(err);
        }
    };
    // Add this state for tracking selected project    
    // Modify the project selection handler
    const handleProjectSelect = (project) => {
        setSelectedProject(project);
        setFormData({
            ...formData,
            projectId: project.ProjectID,
            projectName: project.ProjectName
        });
        setSearchTerm(''); // Clear search term after selection
    };
    
    // Update the project search section in the return statement
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
                        Select Project
                    </label>
                    {selectedProject ? (
                        <div className="p-3 border border-gray-300 rounded-md bg-gray-50">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{selectedProject.ProjectName}</span>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setSelectedProject(null);
                                        setFormData({...formData, projectId: '', projectName: ''});
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="relative">
                                <FolderPlus className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={searchTerm}  // Changed from selectedProject to searchTerm
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Search projects..."
                                />
                            </div>
                            {searchTerm && (
                                <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                                    {filteredProjects.length > 0 ? (
                                        filteredProjects.map(project => (
                                            <div 
                                                key={project.ProjectID}
                                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => handleProjectSelect(project)}
                                            >
                                                {project.ProjectName}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-2 text-gray-500">
                                            No matching projects found
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                    {error && !formData.projectId && (
                        <p className="mt-1 text-sm text-red-600">Please select a project</p>
                    )}
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
