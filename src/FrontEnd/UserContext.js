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
    const [state, dispatch] = useReducer(userReducer, { user: '' }); // Khởi tạo state với useReducer

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get('http://localhost:3001/check-auth', { withCredentials: true });
                if (response.data.success) {
                    const DataOfUser = response.data.user;
                    dispatch({ type: 'SET_USER', payload: DataOfUser }); // Lưu thông tin người dùng
                } else {
                    dispatch({ type: 'CLEAR_USER' }); // Nếu không xác thực, đặt user là null
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                dispatch({ type: 'CLEAR_USER' }); // Đặt user là null nếu có lỗi
            }
        }
        fetchData();
    }, []);

    return (
        <UserContext.Provider value={{ user: state.user, setUser: (user) => dispatch({ type: 'SET_USER', payload: user }) }}>
            {children}
        </UserContext.Provider>
    );
}

// Custom hook to use context
export const useUser = () => useContext(UserContext);