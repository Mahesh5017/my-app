import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Signup from "./Pages/SignUp";
import Navbar from "./Components/Navbar";
import Dashboard from "./Pages/Dashboard";
import Devices from "./Pages/Devices";
import Settings from "./Pages/Settings";
import { UserProvider } from "./Context/UserContext";
import { WebSocketProvider } from './Context/WebSocketContext';
import ForgotPassword from "./Pages/ForgotPassword";
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    <UserProvider>
      <WebSocketProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={
              <><Navbar />
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/devices" element={<Devices />} />
                  <Route path="/settings" element={<Settings/>} />
                </Routes>
              </>
            } />
          </Routes>
        </Router>
      </WebSocketProvider>
    </UserProvider>
  )
}
export default App;