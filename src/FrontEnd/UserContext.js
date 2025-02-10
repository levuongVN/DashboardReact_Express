import { createContext, useContext, useReducer, useEffect } from "react";
import axios from 'axios';

// Định nghĩa reducer
const userReducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload };
        case 'CLEAR_USER':
            return { ...state, user: null };
        default:
            return state;
    }
};

const UserContext = createContext();

export default function UserProvider({ children }) {
    const [state, dispatch] = useReducer(userReducer, { user: null });

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`http://localhost:3001/check-auth`, { 
                    withCredentials: true, 
                    headers: { 'x-session-id': localStorage.getItem('sessionId') } 
                });

                if (response.data.success) {
                    const DataOfUser = response.data.user;
                    
                    // ✅ Lưu sessionId vào localStorage nếu chưa có
                    if (DataOfUser.sessionId) {
                        localStorage.setItem('sessionId', DataOfUser.sessionId);
                    }

                    dispatch({ type: 'SET_USER', payload: DataOfUser });
                } else {
                    dispatch({ type: 'CLEAR_USER' });
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                dispatch({ type: 'CLEAR_USER' });
            }
        }
        fetchData();
    }, []);

    return (
        <UserContext.Provider value={{
            user: state.user,
            setUser: (user) => {
                // ✅ Khi setUser, cũng lưu sessionId
                if (user && user.sessionId) {
                    localStorage.setItem('sessionId', user.sessionId);
                } else {
                    localStorage.removeItem('sessionId');
                }
                dispatch({ type: 'SET_USER', payload: user });
            }
        }}>
            {children}
        </UserContext.Provider>
    );
}

// Custom hook to use context
export const useUser = () => useContext(UserContext);
