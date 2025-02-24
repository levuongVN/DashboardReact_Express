/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useUser } from "../../UserContext";
import { Notifications } from "@mui/icons-material";
export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notification, setNotification] = useState([]); // Initialize as empty array
    const [isAcp, setIsAcp] = useState(null);
    const [isAccept, setIsAccept] = useState([]);
    const { user, setUser } = useUser()
    const ws = useRef(null);

    useEffect(() => {
        const email = user?.email
        if (email) {
            const socket = new WebSocket('ws://localhost:3001')
            socket.onopen = () => {
                // console.log('WebSocket Connected');
                socket.send(JSON.stringify({ type: "online", email: email }));
            }

            // Thêm handler để lắng nghe thông báo mới
            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // console.log("Received notification:", data);

                    if (data.type === "invite") {
                        // Thêm thông báo mới vào state
                        console.log(data)
                        setNotification(prev => [...prev, {
                            EmailPersonIsInvited: data.from,
                            ProjectName: data.projectName,
                            // Thêm các thông tin khác nếu cần
                        }]);
                    }
                    if (data.type === "AcpStt") {
                        // console.log(data)
                        setIsAccept(prev => [...prev, {
                            EmailPersonIsInvited: data.from,
                            ProjectName: data.notifications,
                            AcpStt: data.AcpStt,
                            Type: data.type
                        }])
                        // setNotification(
                        //     prev => [...prev, {
                        //         EmailPersonIsInvited: data.EmailPersonIsInvited,
                        //         ProjectName: data.ProjectName,
                        //         AcpStt: data.AcpStt
                        //     }]
                        // )

                    }
                } catch (error) {
                    console.error("Error processing message:", error);
                }
            }
            ws.current = socket;

            // Fetch existing notifications
            const getNotifications = async () => {
                try {
                    const response = await axios.get('http://localhost:3001/InviteGet', {
                        params: { email: email },
                        withCredentials: true
                    });
                    setNotification(response.data.data);
                    // console.log(response.data)
                } catch (err) {
                    console.error('Error fetching notifications:', err);
                }
            }
            getNotifications();
            // Cleanup function
            return () => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
                ws.current = null;
            }
        }
    }, [user])
    // Lấy thông báo từ API
    async function GetAcpStt(Stt, ProjectName, EmailPersonIsInvited) {
        try {
            const response = await axios.patch('http://localhost:3001/Accept-invite',
                { AcpStt: Stt, email: user?.email, ProjectName: ProjectName },
                { withCredentials: true }
            );
            if (response.data.success) {
                setNotification(prev => prev.filter(item => item.ProjectName !== ProjectName));
            }
            if (ws) {
                ws.current.send(JSON.stringify(
                    {
                        type: "AcpStt",
                        from: user?.email, // gửi email để lấy người dùng onl
                        to: EmailPersonIsInvited, // ng duoc gui
                        AcpStt: Stt, // trạng thái lời mời
                        notifications: ProjectName  // tên dự án cho vào notifi
                    }
                ));
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    }
    const Click = (e, item) => {
        e.preventDefault()
        //  console.log(item.ProjectName)
        if (e.target.name === 'Acp') {
            setIsAcp(true)
            GetAcpStt(true, item.ProjectName, item.EmailPersonIsInvited)
        } else {
            setIsAcp(false)
            GetAcpStt(false, item.ProjectName)
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
                {(Array.isArray(notification) && notification.length > 0) || (Array.isArray(isAccept) && isAccept.length > 0) ? (
                    <div className="absolute block w-3 h-3 bg-red-500 border-2 border-white rounded-full -top-0.5 start-2.5 dark:border-gray-900"></div>
                ) : null}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute -right-5 my-2 z-20 max-w-sm bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-800 dark:divide-gray-700">
                    <div className="block px-4 py-2 font-medium text-center text-gray-700 rounded-t-lg bg-gray-50 dark:bg-gray-800 dark:text-white">
                        Notifications
                    </div>
                    <div>
                        {Array.isArray(notification) && notification.map((item, index) => (
                            <div key={index} className="block px-1 py-2 text-sm text-gray-700 dark:text-white">
                                <div style={{ width: "100%" }}>
                                    <a href="#" className="">
                                        <div className="flex items-center rounded-lg py-1 text-black align-items-center px-4">
                                            <img className="rounded-full w-8 h-8" src={`${item.Img_avt}`} alt="Rounded avatar" />
                                            <div className="ms-2 me-3">
                                                You were invited by "{item.EmailPersonIsInvited}" to "{item.ProjectName}" project
                                            </div>
                                        </div>
                                    </a>
                                    <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 border-bottom pb-2">
                                        <button onClick={(e) => Click(e, item)} name="Acp" className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mr-2">
                                            Accept
                                        </button>
                                        <button id="Rj" onClick={(e) => Click(e, item)} className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {Array.isArray(isAccept) && isAccept.map((item, index) => (
                            <div key={index} className="block px-1 py-2 text-sm text-gray-700 dark:text-white">
                                <div style={{ width: "100%" }}>
                                    <a href="#" className="">
                                        <div className="flex items-center rounded-lg py-1 text-black align-items-center px-4">
                                            {item.AcpStt ? 
                                            <div className="ms-2 me-3">
                                               "{item.EmailPersonIsInvited}" accepted the invitation for the "{item.ProjectName}" project.
                                            </div> :
                                            <div className="ms-2 me-3">
                                                "{item.EmailPersonIsInvited}" rejected the invitation for the "{item.ProjectName}" project.
                                            </div>
                                            }
                                        </div>
                                    </a>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
