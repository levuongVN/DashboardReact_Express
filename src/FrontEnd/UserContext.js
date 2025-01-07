import { createContext, useContext, useState, useEffect } from "react";
import axios from 'axios';

const UserContext = createContext();

export default function UserProvider({ children }) {
    const [user, setUser] = useState(null); // Khởi tạo state user

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get('http://localhost:3001/check-auth', { withCredentials: true });
                if (response.data.success) {
                    setUser(response.data.user); // Lưu thông tin người dùng
                } else {
                    setUser(null); // Nếu không xác thực, đặt user là null
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                setUser(null); // Đặt user là null nếu có lỗi
            }
        }
        fetchData();
    }, []);
    console.log(user?.ImgAvt)

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

// Custom hook to use context
export const useUser = () => useContext(UserContext);