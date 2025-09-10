import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./frontend/Login";
import Register from "./frontend/Register";
import Dashboard from "./frontend/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
      </Routes>
    </Router>
  );
}

export default App;
