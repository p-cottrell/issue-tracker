import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './api/ProtectedRoute';
import Home from './pages/home/Home';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Dashboard from './pages/dashboard/Dashboard';
import IssueView from './pages/issueview/IssueView';



function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />}
        />
        
        <Route path="/issues/:id" element={<IssueView />} />
      </Routes>
    </div>
  );
}

export default App;