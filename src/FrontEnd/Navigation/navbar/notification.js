/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../../UserContext";
export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notification, setNotification] = useState([]);
    const [isAcp, setIsAcp] = useState(null);
    const { user, setUser } = useUser()
    useEffect(() => {
        // console.log(user?.email);
        const email = user?.email
        if (email) {
            const getNotifications = async () => {
                try {
                    const response = await axios.get('http://localhost:3001/InviteGet', {
                        params: { email: email },  // Truyền email dưới dạng object
                        withCredentials: true
                    });
                    if (response.data.success) {
                        setNotification(response.data.data);
                    }
                } catch (err) {
                    console.error('Error fetching notifications:', err);
                }
            }
            getNotifications();
        }
    }, [user])
    // Lấy thông báo từ API
        async function GetAcpStt (Stt) {
            console.log(Stt)
            try {
                const response = await axios.post('http://localhost:3001/Accept-invite',
                    { AcpStt: Stt, email: user?.email },
                    {withCredentials: true}
                );
                if (response.data.success) {
                    setNotification(response.data.data);
                }
            } catch (err) {
                console.error('Error fetching notifications:', err);
            }
        }
    const Click = (e)=>{
        e.preventDefault()
        if(e.target.name==='Acp'){
            setIsAcp(true)
            GetAcpStt(true)
        }else{
            setIsAcp(false)
            GetAcpStt(false)
        }
    }
    return (
        <div className="relative">
            {/* Nút mở dropdown */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative inline-flex items-center text-sm font-medium text-center text-gray-100 hover:text-gray-400 dark:hover:text-white dark:text-gray-400"
            >
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 14 20">
                    <path d="M12.133 10.632v-1.8A5.406 5.406 0 0 0 7.979 3.57.946.946 0 0 0 8 3.464V1.1a1 1 0 0 0-2 0v2.364a.946.946 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C1.867 13.018 0 13.614 0 14.807 0 15.4 0 16 .538 16h12.924C14 16 14 15.4 14 14.807c0-1.193-1.867-1.789-1.867-4.175ZM3.823 17a3.453 3.453 0 0 0 6.354 0H3.823Z" />
                </svg>
                {/* Chấm đỏ hiển thị số lượng thông báo */}
                {notification.length > 0 && (
                    <div className="absolute block w-3 h-3 bg-red-500 border-2 border-white rounded-full -top-0.5 start-2.5 dark:border-gray-900"></div>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute -right-5 my-2 z-20 max-w-sm bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-800 dark:divide-gray-700">
                    <div className="block px-4 py-2 font-medium text-center text-gray-700 rounded-t-lg bg-gray-50 dark:bg-gray-800 dark:text-white">
                        Notifications
                    </div>
                    <div>
                        {notification.map((item, index) => (
                            <div key={index} className="block px-1 py-2 text-sm text-gray-700 dark:text-white">
                                <div style={{ width: "100%" }}>
                                    <a href="#" className="">
                                        <div className="flex items-center rounded-lg py-1 text-black align-items-center px-4">
                                            <img className="rounded-full w-8 h-8" src="http://localhost:3001/uploads/1739025889480-RonaldoCry5.png" alt="Rounded avatar" />
                                            <div className="ms-2 me-3">
                                                You were invited by "{item.EmailPersonIsInvited}" to "{item.ProjectName}" project
                                            </div>
                                        </div>
                                    </a>
                                    <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 border-bottom pb-2">
                                        <button onClick={Click} name="Acp" className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mr-2">
                                            Accept
                                        </button>
                                        <button id="Rj" className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
