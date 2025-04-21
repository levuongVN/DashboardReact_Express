import { useEffect, useState, useRef } from "react";
import { Plus } from "lucide-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPeopleGroup } from '@fortawesome/free-solid-svg-icons';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useUser } from "../../../../UserContext";
import { useWebSocket } from "../../../../WebSocketContext";
import { useProjects } from '../../../../ProjectsContext';
import SelectRole from './SelectRole';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css';

const MakeTeamForm = ({ closeStt }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedColleagues, setSelectedColleagues] = useState([]);
    const [filteredColleagues, setFilteredColleagues] = useState([]);
    const [mockColleagues, setMockColleagues] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProject, setSelectedProject] = useState(""); // Add this line
    const rolesRef = useRef({});
    const { sendMessage } = useWebSocket();
    const { user } = useUser();
    const { projects } = useProjects();
    const [availableProjects, setAvailableProjects] = useState([]);

    useEffect(() => {
        if (projects){
            // console.log(projects)
            setAvailableProjects(projects);
        }
    }, [projects]);
    // console.log(availableProjects);
    useEffect(() => {
        const GetMember = async () => {
            const res = await axios.get('http://localhost:3001/Members',{
                params: { email: user?.email },
                withCredentials: true
            });
            if (res.data.success) {
                setMockColleagues(res.data.members);
            }
        };
        GetMember();
    }, [user]);
    // console.log(mockColleagues);

    const handleCheckboxChange = (id) => {
        if (!selectedColleagues.includes(id)) {
            // Khi thêm mới một colleague, set role mặc định là Member
            rolesRef.current[id] = 'Member';
        } else {
            // Khi bỏ chọn một colleague, xóa role của họ
            delete rolesRef.current[id];
        }
        
        setSelectedColleagues(
            selectedColleagues.includes(id)
                ? selectedColleagues.filter((colleagueId) => colleagueId !== id)
                : [...selectedColleagues, id]
        );
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        const Check = mockColleagues.filter(
            colleague => colleague.UserName.toLowerCase().includes(e.target.value.toLowerCase())
        );
        setFilteredColleagues(Check);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.length === 0) {
            toast.error("Please enter team name", { autoClose: 3000 }); // Use toast for notification
            return;
        }
        if (selectedProject === "") {
            toast.error("Please select a project", { autoClose: 3000 }); // Use toast for notification
            return;
        }
        if (selectedColleagues.length === 0) {
            toast.error("Please choose at least one colleague", { autoClose: 3000 }); // Use toast for notification
            return;
        }
        const message = {
            type: 'CreateTeam',
            team: {
                from: user?.email,
                name: name, // Team name
                info: description,
                members: selectedColleagues.map(id => ({
                    id,
                    role: rolesRef.current[id] || 'Member' // Default role if not set
                })),
            },
        };
        if (name.length > 0 && selectedColleagues.length > 0) {
            sendMessage(JSON.stringify(message));
            setDescription("");
            setName("");
            setSelectedColleagues([]);
            PostData(); // Call child function to save data to SQL Server
            toast.success("Team created successfully", { autoClose: 3000 }); // Use toast for notification
        }
    };
    // post data to save in SQL Server at child function for submit
    const PostData = async () => {
        const ResSave = await axios.post('http://localhost:3001/saveTeam', {
            NameTeam: name,
            Email: user?.email,
            Role: 'Admin',
            ProjectID: selectedProject
        });
        if (ResSave.data.success === true) {
            const resPostInvite = await axios.post('http://localhost:3001/Teams-invite', {
                TeamName: name,
                SenderEmail: user?.email,
                ReceiverEmail: selectedColleagues,
                Status: 'Pending',
                ProjectID: selectedProject,
                Role: rolesRef.current[selectedColleagues]
            },{ withCredentials: true })
            console.log(resPostInvite)
        }
    };

    const handleClose = (e) => {
        e.preventDefault(); // Add this to prevent form submission
        setDescription("");
        setName("");
        setSelectedColleagues([]);
        closeStt(false);
    };

    return (
        <form className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <ToastContainer />
            <div>
                <div className="flex justify-end">
                    <button type="button" onClick={handleClose} className="flex justify-center rounded-md bg-gray-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500">
                        Close
                    </button>
                </div>


                {/* Existing Team Name input */}
                <div className="col-12">
                    <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                        <FontAwesomeIcon className="me-1" icon={faPeopleGroup} />
                        Team Name
                    </label>
                    <input
                        type="text"
                        id="teamName"
                        name="teamName"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter team name"
                        onChange={e => setName(e.target.value)}
                        value={name} />
                </div>
                <div className="col-12 mb-1 mt-3">
                    <label htmlFor="project" className="block text-sm font-medium text-gray-700">
                        <FontAwesomeIcon className="me-1" icon={faCircleInfo} />
                        Select Project
                    </label>
                    {/* // Trong phần render của select box, thay mockProjects bằng availableProjects */}
                    <select
                        id="project"
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">Select a project</option>
                        {availableProjects.map((project) => (
                            <option key={project.ProjectID} value={project.ProjectID}>
                                {project.ProjectName}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700">
                        <FontAwesomeIcon className="me-1 mt-2" icon={faCircleInfo} />
                        Description
                    </label>
                    <textarea
                        id="teamDescription"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter team description"
                        rows={3}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Invite Colleagues</label>
                    <div>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full m-1 px-2 py-0 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Search colleague..."
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                            {selectedColleagues.length > 0 && selectedColleagues.map(
                                colleague => (
                                    <div key={colleague} className="px-4 py-2 hover:bg-gray-100 row">
                                        <div className="col">
                                            {colleague}
                                        </div>
                                        <div className="col border-start">
                                            <SelectRole
                                                selectedRole={(role) => {
                                                    rolesRef.current[colleague] = role;
                                                    console.log('Updated roles:', rolesRef.current);
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            )}
                            {searchQuery && (
                                <div className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto z-10">
                                    {filteredColleagues.length > 0 ? (
                                        filteredColleagues.map((colleague) => (
                                            <div
                                                key={colleague.EmailColleagues}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => {
                                                    handleCheckboxChange(colleague.EmailColleagues);
                                                    setSearchQuery('');
                                                }}
                                            >
                                                {colleague.UserName}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-gray-500">
                                            No colleagues found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* List colleagues */}
                    <div className="mt-2 space-y-2">
                        {mockColleagues.map((colleague) => (
                            <div key={colleague.EmailColleagues} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`colleague-${colleague.EmailColleagues}`}
                                    name={`colleague-${colleague.UserName}`}
                                    checked={selectedColleagues.includes(colleague.EmailColleagues)}
                                    onChange={() => handleCheckboxChange(colleague.EmailColleagues)}
                                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={`colleague-${colleague.EmailColleagues}`} className="text-sm text-gray-700">
                                    {colleague.UserName}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button
                type="submit"
                onClick={handleSubmit}
                className="flex mt-2 w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                <Plus className="mr-2 h-4 w-4" />
                Make Team & Invite
            </button>
        </form>
    );
};

export default MakeTeamForm;