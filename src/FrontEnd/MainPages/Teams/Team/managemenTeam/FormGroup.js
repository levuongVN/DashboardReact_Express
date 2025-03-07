import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPeopleGroup } from '@fortawesome/free-solid-svg-icons';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useUser } from "../../../../UserContext";
import { useWebSocket } from "../../../../WebSocketContext";
import axios from "axios";

const MakeTeamForm = ({ closeStt }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedColleagues, setSelectedColleagues] = useState([]); // Save colleagues are chosen
    const [filteredColleagues, setFilteredColleagues] = useState([]);
    const [mockColleagues, setMockColleagues] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const { sendMessage, connectedUsers } = useWebSocket();
    const { user } = useUser();

    // Lấy dữ liệu từ server tại đây
    useEffect(() => {
            const GetMember = async () => {
                const res = await axios.get('http://localhost:3001/Members')
                if(res.data.success){
                    // console.log(res.data.members)
                    setMockColleagues(res.data.members)
                }
            }
            GetMember();
            // Socket connection
    }, [user]);

    const handleCheckboxChange = (id) => {
        setSelectedColleagues(
            selectedColleagues.includes(id)
                ? selectedColleagues.filter((colleagueId) => colleagueId !== id)
                : [...selectedColleagues, id]
        )
    };
    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
        let Check = mockColleagues.filter(
            colleague => colleague.UserName.toLowerCase().includes(e.target.value.toLowerCase())
        )
        setFilteredColleagues(Check)
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        if(selectedColleagues.length === 0) {
            alert("Please choose at least one colleague")
            return;
        }
        const message = {
            type: 'CreateTeam',
            team: {
                from: user?.email,
                name: name,
                info: description,
                members: selectedColleagues,
            },
        };
        // Gửi dữ liệu tới server tại đây
        console.log("Sending team data:", message);
        sendMessage(message);
        // Gọi hàm đóng form tại đây
        setDescription("")
        setName("")
        setSelectedColleagues([])
        closeStt(false);
    };
    const handleClose = () => {
        // Gọi hàm đóng form tại đây
        setDescription("")
        setName("")
        setSelectedColleagues([])
        closeStt(false);
    }

    return (
        <form className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <div>
                <div className="flex justify-end">
                    <button
                        onClick={handleClose}
                        className="flex justify-center rounded-md bg-gray-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
                    >
                        Close
                    </button>
                </div>
                <div className="col-12">
                    <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                        <FontAwesomeIcon className="me-1" icon={faPeopleGroup} />
                        Team Name
                    </label>
                    <input
                        type="text"
                        id="teamName"
                        name="teamName"
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter team name"
                        onChange={e => setName(e.target.value)}
                        required
                        value={name} />
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
                            {/* search suggestions colleagues */}
                            {   selectedColleagues.length >0 && selectedColleagues.map(
                                    colleague => (
                                        <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                            {colleague}
                                        </div>
                                    )
                                )
                            }
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