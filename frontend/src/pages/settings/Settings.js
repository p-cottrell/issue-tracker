import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Logo from '../../components/Logo';

const Settings = () => {
  const navigate = useNavigate();

  // State to handle the theme mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Default filter state for issues and status
  const [defaultFilter, setDefaultFilter] = useState({
    issueFilter: 'all', // Default to "all"
    statusFilter: 'all', // Default to "all"
  });

  // Check localStorage for saved settings on initial render
  useEffect(() => {
    // Load theme from localStorage
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

  // Function to handle filter selection
  const handleFilterSelection = (type, value) => {
    const updatedFilter = { ...defaultFilter, [type]: value };
    setDefaultFilter(updatedFilter);
    localStorage.setItem(`default${type.charAt(0).toUpperCase() + type.slice(1)}Filter`, value); // Save to localStorage
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-dark">
      {/* Header */}
      <header className="relative bg-primary shadow p-4 flex items-center justify-between">
        <div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold focus:outline-none transition-transform transform hover:scale-105 hover:shadow-lg flex items-center space-x-2 lg:hidden"
          >
            <span className="text-lg font-bold">☰</span>
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
          {/* Container for Settings */}
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
            {/* Default Dashboard Filter Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-dark dark:text-neutral">Default Dashboard Filters</h2>
              {/* Filter options for Issues */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-dark dark:text-gray-200">Issues Filter</h3>
                <div className="flex items-center justify-between">
                  <span className="text-dark dark:text-neutral">All Issues</span>
                  <button
                    onClick={() => handleFilterSelection('issueFilter', 'all')}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                      defaultFilter.issueFilter === 'all' ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`${
                        defaultFilter.issueFilter === 'all' ? 'translate-x-6' : 'translate-x-1'
                      } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-dark dark:text-neutral">My Issues</span>
                  <button
                    onClick={() => handleFilterSelection('issueFilter', 'myIssues')}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                      defaultFilter.issueFilter === 'myIssues' ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`${
                        defaultFilter.issueFilter === 'myIssues' ? 'translate-x-6' : 'translate-x-1'
                      } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                    />
                  </button>
                </div>
              </div>

              {/* Filter options for Status */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-dark dark:text-gray-200">Status Filter</h3>
                {['all', 'Complete', 'InProgress', 'Cancelled', 'Pending'].map((status, index) => (
                  <div key={index} className="flex items-center justify-between mt-2">
                    <span className="text-dark dark:text-neutral">{status === 'all' ? 'All Statuses' : status}</span>
                    <button
                      onClick={() => handleFilterSelection('statusFilter', status)}
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                        defaultFilter.statusFilter === status ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`${
                          defaultFilter.statusFilter === status ? 'translate-x-6' : 'translate-x-1'
                        } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Dark Mode Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-dark dark:text-neutral">Theme Settings</h2>
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;