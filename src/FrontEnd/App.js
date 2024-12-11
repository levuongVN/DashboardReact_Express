// import './App.css';
// import TodoText from './LeftSide/TodoText';
import Navbars from './Navigation/navbar/NavigationBars';
import UILogin from './Navigation/navbar/Login/UILogin';
import Register from './Navigation/navbar/Register/Register';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter,Routes, Route} from 'react-router-dom';
import { useState } from 'react';
function App() {
  const [UserNames, setUserNames] = useState('');
  return (
    <div className="App bg-dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navbars userName={UserNames} />} />
          <Route path="/Login" element={<UILogin setUserName={setUserNames} />} />
          <Route path="/Register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
export default App;