// import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbars from './Navigation/navbar/NavigationBars';
import Test from './test'; // test component
import UILogin from './Navigation/navbar/Login/UILogin';
import Register from './Navigation/navbar/Register/Register';
import SettingUser from './Navigation/navbar/SettingUser/set';
import UserProvider from './UserContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  return (
    <UserProvider>
      <div className="App bg-dark">
        <BrowserRouter>
          <Routes>
            <Route exact path="/" element={<Navbars />} />
            {/* <Route path="/" element={<Test />} /> */}
            <Route path="/Login" element={<UILogin />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/Setting" element={<SettingUser />} />
          </Routes>
        </BrowserRouter>
      </div>
    </UserProvider>
  );
}

export default App;