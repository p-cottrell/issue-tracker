import React, { useState, useEffect } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Logo from '../../components/Logo';

const Settings = () => {
  const navigate = useNavigate();

  // State to handle the theme mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check localStorage for saved theme preference on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Function to handle theme toggle
  const handleThemeToggle = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-dark">
      {/* Header */}
      <header className="relative bg-primary shadow p-4 flex items-center justify-between">
        {/* Left: Logo and Hamburger */}
        <div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold focus:outline-none transition-transform transform hover:scale-105 hover:shadow-lg flex items-center space-x-2 lg:hidden"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <span className="hidden lg:inline">
            <Logo className="truncate text-neutral xs:text-base md:text-lg lg:text-4xl" navigate={navigate} useClick={true} />
          </span>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex flex-grow">
        {/* Sidebar */}
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} navigate={navigate} />

        {/* Main Content */}
        <main className="flex-grow p-6">
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
            <h2 className="text-2xl font-semibold mb-6 text-dark dark:text-neutral">Settings</h2>
            {/* Theme toggle option */}
            <div className="flex items-center justify-between">
              <span className="text-dark dark:text-neutral">Dark Mode</span>
              <button
                onClick={handleThemeToggle}
                className='dark:bg-primary bg-gray-300 relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none'
              >
                <span
                  className={`${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
