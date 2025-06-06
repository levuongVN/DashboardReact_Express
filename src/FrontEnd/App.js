/* eslint-disable no-unused-vars */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbars from './Navigation/navbar/NavigationBars';
import Test from './test'; // test component
import UILogin from './Navigation/navbar/Login/UILogin';
import Register from './Navigation/navbar/Register/Register';
import SettingUser from './Navigation/navbar/SettingUser/set';
import UserProvider from './UserContext';
import WebSocketProvider from './WebSocketContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Team from './MainPages/Teams/Teams';
import ManagementTeam from './MainPages/Teams/Team/managemenTeam/Management'
import  ProjectsProvider from './ProjectsContext';
import TeamDetails from './MainPages/Teams/Team/managemenTeam/TeamDetail';


function App() {
  return (
    <UserProvider>
      <WebSocketProvider>
      <ProjectsProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route exact path="/" element={<Navbars />} />
            {/* <Route path="/" element={<Test userId="user1" />} /> */}
            <Route path="/Login" element={<UILogin />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/Setting" element={<SettingUser />} />
            <Route path="/Team" element={<Team />} />
            <Route path="/Team/Management" element={<ManagementTeam />} />
            <Route path="/Team/Management/Team-Detail/:TeamID" element={<TeamDetails />} />
          </Routes>
        </BrowserRouter>
      </div>
      </ProjectsProvider>
      </WebSocketProvider>
    </UserProvider>
  );
}

export default App;