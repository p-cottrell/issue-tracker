import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './api/ProtectedRoute';
import { ModalProvider } from './context/ModalContext';
import Dashboard from './pages/dashboard/Dashboard';
import Home from './pages/home/Home';
import Login from './pages/login/Login';
import Register from './pages/register/Register';

const App = () => {
  return (
    <ModalProvider>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />}
          />
        </Routes>
      </div>
    </ModalProvider>
  );
};

export default App;