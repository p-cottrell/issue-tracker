import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import AddIssuePopup from '../../components/AddIssuePopup';

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
    let charm = "c";

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
      <header className="bg-blue-600 shadow p-4 flex justify-between items-center text-white">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="focus:outline-none lg:hidden">
          <Bars3Icon className="w-6 h-6" />
        </button>
        <div className="flex-1 flex justify-center px-4">
          <input type="text" placeholder="Search..." className="px-4 py-2 border rounded-lg w-full max-w-md text-black" />
        </div>
        <button onClick={openAddHandler} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + New Issue
        </button>
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
            <button className="w-full text-left text-gray-700 font-semibold" onClick={() => navigate('/')}>Dashboard</button>
            <button className="w-full text-left text-gray-700 font-semibold" onClick={() => navigate('/profile')}>Profile</button>
            <button className="w-full text-left text-gray-700 font-semibold" onClick={() => navigate('/settings')}>Settings</button>
            <button className="w-full text-left text-gray-700 font-semibold" onClick={() => navigate('/logout')}>Log Out</button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <div key={issue._id} className="bg-white shadow-md rounded-lg p-4 min-h-[200px] flex flex-col justify-between">
                <h3 className="text-lg font-semibold mb-2">{issue.title}</h3>
                <p className="text-gray-600">{issue.description}</p>
                <div className="mt-4">
                  <button className="text-blue-500 hover:underline" onClick={() => navigate(`/issues/${issue._id}`)}>View more</button>
                </div>
              </div>
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