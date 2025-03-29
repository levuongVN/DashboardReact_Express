import { createContext, useContext, useReducer, useEffect, useRef,useState } from "react";
import { useUser } from './UserContext';

const wsReducer = (state, action) => {
    switch (action.type) {
        case 'SET_SOCKET':
            return { ...state, ws: action.payload };
        case 'SET_CONNECTED_USERS':
            return { ...state, connectedUsers: action.payload };
        case 'CLEAR_SOCKET':
            return { ...state, ws: null, connectedUsers: [] };
        default:
            return state;
    }
};

const WebSocketContext = createContext();

export default function WebSocketProvider({ children }) {
    const [state, dispatch] = useReducer(wsReducer, { 
        ws: null, 
        connectedUsers: [] 
    });
    const [notifications, setNotifications] = useState([]);
    
    const socketRef = useRef(null);
    const isSocketOpen = useRef(false);
    const { user } = useUser();

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:3001');
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('WebSocket Connected');
            isSocketOpen.current = true;
            dispatch({ type: 'SET_SOCKET', payload: socket });
            
            if (user?.email) {
                socket.send(JSON.stringify({
                    type: "online",
                    email: user.email
                }));
            }
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // console.log("Received:", data);
            if (data.type === "online") {
                dispatch({ type: 'SET_CONNECTED_USERS', payload: data.connectedUsers });
            }
            if (data.type === "invite") {
                setNotifications(prev => [...prev, data]);
            }
            if(data.type === "CreateTeam"){
                setNotifications(prev => [...prev, data]);
            }
            if(data.type === "AcpStt") {
                setNotifications(prev => [...prev, data]);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket Disconnected');
            isSocketOpen.current = false;
            dispatch({ type: 'CLEAR_SOCKET' });
        };

        socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
            isSocketOpen.current = false;
            dispatch({ type: 'CLEAR_SOCKET' });
        };

        return () => {
            if (socketRef.current) {
                if (isSocketOpen.current) {
                    socketRef.current.close();
                    console.log('WebSocket closed before component unmounted');
                }
                socketRef.current = null;
            }
        };
    }, [user]);

    const sendMessage = (message) => {
        if (socketRef.current && isSocketOpen.current) {
            socketRef.current.send(message);
        } else {
            console.error("WebSocket connection not established");
        }
    };

    return (
        <WebSocketContext.Provider value={{
            ws: socketRef.current,
            connectedUsers: state.connectedUsers,
            notifications: notifications,
            setNotifications:setNotifications,
            sendMessage
        }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export const useWebSocket = () => useContext(WebSocketContext);