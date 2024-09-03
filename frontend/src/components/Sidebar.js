import { ArrowLeftStartOnRectangleIcon, CogIcon, HomeIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import LogoutConfirmation from './logoutConfirmation';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const handleLogout = async () => {
    if (!showLogoutConfirmation) {
      setShowLogoutConfirmation(true);
      return;
    }

    try {
      // Make the API request to log out the user
      await apiClient.post('/api/users/logout');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      // TODO: Handle the error (e.g., show an error message)
    } finally {
      setShowLogoutConfirmation(false);
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:h-full`}>
        <div className="h-full p-4 space-y-4 flex flex-col">
          {/* Sidebar State Toggle */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-700">Menu</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-700 lg:hidden">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          {/* Sidebar Items */}
          <button className="w-full text-left text-gray-700 font-semibold flex items-center space-x-2 hover:bg-gray-200 focus:bg-gray-300 p-2 rounded transition-all" onClick={() => navigate('/')}>
            <HomeIcon className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button className="w-full text-left text-gray-700 font-semibold flex items-center space-x-2 hover:bg-gray-200 focus:bg-gray-300 p-2 rounded transition-all" onClick={() => navigate('/profile')}>
            <UserIcon className="w-5 h-5" />
            <span>Profile</span>
          </button>
          <button className="w-full text-left text-gray-700 font-semibold flex items-center space-x-2 hover:bg-gray-200 focus:bg-gray-300 p-2 rounded transition-all" onClick={() => navigate('/settings')}>
            <CogIcon className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button className="w-full text-left text-gray-700 font-semibold flex items-center space-x-2 hover:bg-gray-200 focus:bg-gray-300 p-2 rounded transition-all" onClick={handleLogout}>
            <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
      {/* Logout Confirmation Popup */}
      {showLogoutConfirmation && (
        <LogoutConfirmation onConfirm={handleLogout} onCancel={cancelLogout} />
      )}
    </>
  );
};

export default Sidebar;