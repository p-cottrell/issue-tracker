import { ArrowLeftStartOnRectangleIcon, Bars3Icon, CogIcon, HomeIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import AddIssuePopup from '../../components/AddIssuePopup';
import Issue from '../../components/Issue';
import Logo from '../../components/Logo';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [popupHandler, setPopupHandler] = useState(() => () => { });
  const [popupType, setPopupType] = useState(null);
  const [issues, setIssues] = useState([]);
  const [fetched, setFetched] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await apiClient.get('api/issues');
        setIssues(response.data);
        setFetched(true);
      } catch (error) {
        console.error('Error fetching issues:', error);
        setFetched(true);
      }
    };

    fetchIssues();
  }, []);

  const openAddHandler = () => {
    setPopupHandler(() => addHandler);
    setPopupType("add");
    setShowPopup(true);
  };

  const addHandler = (data) => {
    let { title, description } = data;
    let charm = "🐞";

    setShowPopup(false);

    const addIssue = async () => {
      try {
        const response = await apiClient.post('api/issues', {
          title,
          description,
          charm,
        });

        console.log('Issue added:', response.data);
        window.location.reload();
      } catch (error) {
        console.log('There was an error adding the issue:', error);
      }
    };
    addIssue();
  };

  function deleteHandler(data) {
    setShowPopup(false);
    console.log(data._id, " Deleted!");
  }

  if (!fetched) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="relative bg-blue-600 shadow p-4 flex items-center justify-between text-white">
        {/* Left: Logo and Hamburger */}
        <div className="flex items-center">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="focus:outline-none lg:hidden">
            <Bars3Icon className="w-6 h-6" />
          </button>
          <div className="ml-2 flex items-center">
            <Logo className="truncate text-neutral xs:text-base md:text-lg lg:text-4xl" navigate={navigate} />
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 border rounded-lg w-full text-black"
          />
        </div>

        {/* Right: New Issue Button */}
        <div>
          <button onClick={openAddHandler} className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold focus:outline-none transition-transform transform hover:scale-105 hover:shadow-lg">
            + New Issue
          </button>
        </div>
      </header>

      <div className="flex flex-grow">
        {/* Sidebar */}
        <div className={`fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:h-full`}>
          <div className="h-full p-4 space-y-4 flex flex-col">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-700">Menu</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-700 lg:hidden">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
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
            <button className="w-full text-left text-gray-700 font-semibold flex items-center space-x-2 hover:bg-gray-200 focus:bg-gray-300 p-2 rounded transition-all" onClick={() => navigate('/logout')}>
              <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
            {issues.map((issue, index) => (
              <Issue
                key={issue._id}
                index={index}
                data={issue}
                deleteHandler={deleteHandler}
                className="bg-white shadow-md rounded-lg p-4 min-h-[200px] flex flex-col justify-between"
              />
            ))}
          </div>
        </main>
      </div>

      {showPopup && (
        <AddIssuePopup closeHandler={() => setShowPopup(false)} type={popupType} clickHandler={popupHandler} />
      )}
    </div>
  );
};

export default Dashboard;