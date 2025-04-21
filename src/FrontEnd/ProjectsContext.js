import { createContext, useState, useEffect, useContext } from "react";
import axios from 'axios';
import { useUser } from "./UserContext"

// Create a Context
export const Projects = createContext();

export default function ProjectsProvider ({ children }) {
    const [projects, setProjects] = useState([]);
    const { user } = useUser();

    useEffect(() => {
        if (user !== undefined) {
            // fetch the project
            const Fetch = async () => {
                const res = await axios.get('http://localhost:3001/projects', {
                    params: { Manager: user?.email },
                    withCredentials: true
                });
                // console.log(res.data.data);  // log the fetched projects to the console for testing purposes
                setProjects(res.data.data);
            };
            Fetch();
        }
    }, [user]);

    return (
        <Projects.Provider value={{ projects, setProjects }}>
            {children}
        </Projects.Provider>
    );
};

// Custom hook to use the projects context
export  const useProjects = () => useContext(Projects)