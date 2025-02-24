import { useState } from "react";
import { Plus } from "lucide-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPeopleGroup } from '@fortawesome/free-solid-svg-icons';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

const mockColleagues = [
    { id: 1, name: "Alice Johnson" },
    { id: 2, name: "Bob Smith" },
    { id: 3, name: "Charlie Brown" },
    { id: 4, name: "David Williams" }
];

const MakeTeamForm = ({ closeStt }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedColleagues, setSelectedColleagues] = useState([]);

    const handleCheckboxChange = (id) => {
        setSelectedColleagues((prev) =>
            prev.includes(id) ? prev.filter((colleagueId) => colleagueId !== id) : [...prev, id]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if(selectedColleagues.length === 0){
            alert("Please select at least one colleague")
            return;
        }
        // Thêm logic gửi dữ liệu lên server tại đây
    };
    const handleClose = () => {
        // Gọi hàm đóng form tại đây
        setDescription("")
        setName("")
        setSelectedColleagues([])
        closeStt(false);
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
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
                        value={name}/>
                </div>

                <div>
                    <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700">
                    <FontAwesomeIcon className="me-1" icon={faCircleInfo} />
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
                        <input
                            type="text"
                            className="w-full m-1 px-2 py-0 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search colleague..."
                        />
                    </div>
                    <div className="mt-2 space-y-2">
                        {mockColleagues.map((colleague) => (
                            <div key={colleague.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`colleague-${colleague.id}`}
                                    checked={selectedColleagues.includes(colleague.id)}
                                    onChange={() => handleCheckboxChange(colleague.id)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={`colleague-${colleague.id}`} className="ml-2 text-sm text-gray-700">
                                    {colleague.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button
                type="submit"
                className="flex mt-2 w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                <Plus className="mr-2 h-4 w-4" />
                Make Team & Invite
            </button>
        </form>
    );
};

export default MakeTeamForm;
