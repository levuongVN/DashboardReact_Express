// import './App.css';
import Navbars from './Navigation/navbar/NavigationBars';
import UILogin from './Navigation/navbar/Login/UILogin';
import Register from './Navigation/navbar/Register/Register';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [UserNames, setUserNames] = useState('');

  useEffect(() => {
    // Kiểm tra session từ backend
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:3001/check-auth', {
          withCredentials: true
        });
        if (response.data.success) {
          setUserNames(response.data.user.name);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="App bg-dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navbars userName={UserNames} />} />
          <Route path="/Login" element={<UILogin UserName={setUserNames} />} />
          <Route path="/Register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;