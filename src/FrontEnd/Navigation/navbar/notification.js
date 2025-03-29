/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useUser } from "../../UserContext";
import { useWebSocket } from "../../WebSocketContext";
import { isArray } from "lodash";
export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [isAcp, setIsAcp] = useState(null);
    const [isAccept, setIsAccept] = useState([]);
    const { user } = useUser();
    const { notifications, setNotifications } = useWebSocket();
    const { sendMessage } = useWebSocket();
    const TypeNoti = useRef();

    // Load initial notifications
    useEffect(() => {
        const email = user?.email;
        if (email) {
            const FetchNotification = async () => {
                const response = await axios.get('http://localhost:3001/InviteGet', {
                    params: { email: email },
                    withCredentials: true
                });
                const response2 = await axios.get('http://localhost:3001/get-invite-team', {
                    params: { ReceiverEmail: email },
                    withCredentials: true
                });

                if (response.data.success) {
                    setNotifications([response.data.data]);
                }
                if (response2.data.success) {
                    setNotifications([response2.data.data]);
                    TypeNoti.current = "InviteTeam";
                }
            };
            FetchNotification();
        }
    }, [user, setNotifications, TypeNoti]);
    // Update GetAcpStt function
    async function GetAcpStt(Stt, EmailPersonIsInvited, ProjectName,Type, RoleMem) {
        try {
            if(Type === 'InviteColleagues'){
                const response = await axios.patch('http://localhost:3001/Accept-invite',
                    { AcpStt: Stt, email: user?.email, ProjectName: ProjectName },
                    { withCredentials: true }
                );
                if (response.data.success) {
                    setNotifications(prev =>
                        prev.filter(item =>
                            item.ProjectName !== ProjectName && item.team?.name !== ProjectName
                        )
                    );
                    setIsAccept(prev => [...prev, {
                        AcpStt: Stt,
                        EmailPersonIsInvited: user?.email,
                        ProjectName: ProjectName
                    }]);
                    sendMessage(JSON.stringify({
                        type: "AcpStt",
                        from: user?.email,
                        to: EmailPersonIsInvited,
                        AcpStt: Stt,
                        ProjectName: ProjectName
                    }));
                }
            }else if(Type === "CreateTeam"){
                const response = await axios.patch('http://localhost:3001/add-team-members',{
                    AcpStt: Stt,
                    TeamName: ProjectName,
                    MemberEmail: user?.email,
                    Role: RoleMem,
                },{withCredentials: true})
                if (response.data.success) {
                    // Sửa lại phần filter notifications
                    setNotifications(prev => 
                        prev.filter(items => {
                            if (Array.isArray(items)) {
                                // For database-stored invites
                                return !items.some(item => 
                                    item.TeamName === ProjectName && item.ReceiverEmail === user?.email
                                );
                            }
                            // For socket invites (CreateTeam type)
                            if (items.type === 'CreateTeam') {
                                return !(items.team?.name === ProjectName);
                            }
                            // For other types of notifications
                            return !(items.TeamName === ProjectName && items.ReceiverEmail === user?.email);
                        })
                    );
                    
                    // Phần còn lại giữ nguyên
                    if(Stt) {
                        setIsAccept(prev => [...prev, {
                            AcpStt: Stt,
                            EmailPersonIsInvited: user?.email,
                            ProjectName: ProjectName
                        }]);
                    }else{
                        setIsAccept(prev => [...prev, {
                            AcpStt: Stt,
                            EmailPersonIsInvited: user?.email,
                            ProjectName: ProjectName
                        }]);
                    }
                    
                    // Gửi websocket message
                    sendMessage(JSON.stringify({
                        type: "AcpStt",
                        from: user?.email,
                        to: EmailPersonIsInvited,
                        AcpStt: Stt,
                        ProjectName: ProjectName
                    }));
                }
            }

        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    }
    // In the return statement, replace notificationRef.current with notifications
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative inline-flex items-center text-sm font-medium text-center text-gray-100 hover:text-gray-400 dark:hover:text-white dark:text-gray-400"
            >
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 14 20">
                    <path d="M12.133 10.632v-1.8A5.406 5.406 0 0 0 7.979 3.57.946.946 0 0 0 8 3.464V1.1a1 1 0 0 0-2 0v2.364a.946.946 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C1.867 13.018 0 13.614 0 14.807 0 15.4 0 16 .538 16h12.924C14 16 14 15.4 14 14.807c0-1.193-1.867-1.789-1.867-4.175ZM3.823 17a3.453 3.453 0 0 0 6.354 0H3.823Z" />
                </svg>
                {(notifications?.length > 0 || isAccept.length > 0) && (
                    <div className="absolute block w-3 h-3 bg-red-500 border-2 border-white rounded-full -top-0.5 start-2.5 dark:border-gray-900"></div>
                )}
            </button>

            {isOpen && (
                <div className="absolute -right-5 my-2 z-20 max-w-sm bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-800 dark:divide-gray-700">
                    <div className="block px-4 py-2 font-medium text-center text-gray-700 rounded-t-lg bg-gray-50 dark:bg-gray-800 dark:text-white">
                        Notifications
                    </div>
                    <div>
                        {notifications.map((item, index) => (
                            <div key={index} className="block px-1 py-2 text-sm text-gray-700 dark:text-white">
                                <div style={{ width: "100%" }}>
                                    <a href="#" className="">
                                        <div className="flex items-center rounded-lg py-1 text-black align-items-center px-4">
                                            <div className="ms-2 me-3">
                                                {item.type === 'CreateTeam' ? (
                                                    <>
                                                        You were invited by '{item.team.from}' to join team '{item.team.name}'
                                                        <div className="flex mt-1 items-center justify-center text-gray-500 dark:text-gray-400 pb-2">
                                                            <button
                                                                onClick={(e) => GetAcpStt(true, item.team.from, item.team.name, 'CreateTeam', item.team.members?.find(m => m.id === user?.email)?.role)}
                                                                name="Acp"
                                                                className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mr-2"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                id="Rj"
                                                                onClick={(e) => GetAcpStt(false, item.team.from, item.team.name, 'CreateTeam', item.team.members?.find(m => m.id === user?.email)?.role)}
                                                                className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : item.type === 'AcpStt' ? (
                                                    <div className="">
                                                        "{item.from}" accepted the invitation for the "{item.ProjectName}" project.
                                                    </div>
                                                ): TypeNoti.current === 'InviteTeam' && item[index].ReceiverEmail === user?.email ? (
                                                    <>
                                                        You were invited by '{item[index].SenderEmail}' to join team '{item[index].TeamName}'
                                                        <div className="flex mt-1 items-center justify-center text-gray-500 dark:text-gray-400 pb-2">
                                                            <button
                                                                onClick={(e) => GetAcpStt(true,item[index].SenderEmail ,item[index].TeamName, 'CreateTeam', item[index].Role)}
                                                                name="Acp"
                                                                className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mr-2"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                id="Rj"
                                                                onClick={(e) => GetAcpStt(false, item[index].SenderEmail, item[index].TeamName, 'CreateTeam',item[index].Role)}
                                                                className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </>
                                                ):   <>
                                                        <div className="d-flex align-items-center">
                                                            <img className="rounded-full w-8 h-8" src={`${item.Img_avt}`} alt="Rounded avatar" />
                                                            You were invited by "{item.EmailPersonInvited}" to join project "{item.ProjectName}"
                                                        </div>
                                                        <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 border-bottom pb-2">
                                                            <button
                                                                onClick={(e) => GetAcpStt(true, item.EmailPersonInvited,item.ProjectName,'InviteColleagues')}
                                                                name="Acp"
                                                                className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mr-2"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                id="Rj"
                                                                onClick={(e) => GetAcpStt(false, item.EmailPersonInvited,item.ProjectName,'InviteColleagues')}
                                                                className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </>
                                                }
                                            </div>
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
