import { Bars3Icon, PlusIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import AddIssuePopup from '../../components/AddIssuePopup';
import DeleteIssuePopup from '../../components/DeleteIssuePopup';
import Issue from '../../components/Issue';
import Logo from '../../components/Logo';
import Sidebar from '../../components/Sidebar';
import Issue from '../../components/Issue';
import AddIssuePopup from '../../components/AddIssuePopup';
import DeleteIssuePopup from '../../components/DeleteIssuePopup';
import apiClient from '../../api/apiClient';
import LogoHeader from '../../components/LogoHeader';  // Import the new logo header

import '../../styles/base.css';
import '../../styles/loadingRing.css';


const Dashboard = () => {
  const navigate = useNavigate();

  // Show/hide the add and delete popups.
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const [issues, setIssues] = useState([]);
  const [fetched, setFetched] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null); // To let the delete handler know which issue to delete.
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

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

  const openIssueModal = (issue) => {
    setSelectedIssue(issue);
    setIsIssueModalOpen(true);
  };

    if (!fetched) {
        return (
          <div className="loading-container">
            <div className="loading-text">
              <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
            </div>
          </div>
        );
    }

  function openDeleteHandler(issue) {
    setSelectedIssue(issue) // Now the delete handler knows which issue is targeted for deletion.
    setShowDeletePopup(true); // Show the delete issue popup.
  }

  if (!fetched) {
    return (
        <div className="flex flex-col min-h-screen">
          {/* Fixed Logo Header */}
          <LogoHeader />

          <div className="flex flex-grow pt-16">
            {/* Sidebar */}
            <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)} addHandler={() => setShowAddPopup(true)}/>

            {/* Main Content */}
            <div className={`flex-grow p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-[4rem]' : 'ml-[20rem]'}`}>
              <div className="w-full p-5 shadow-md rounded-lg">

                {/* Search bar */}
                <div style={{padding: 20}}>
                  <form onSubmit={(e) => searchHandler(e)}>
                    <input type="text" placeholder="Search for an issue." onChange={(e) => setSearchValue(e.target.value)}/>
                    <button type="submit">Search</button>
                    <button onClick={(e) => searchHandler(e, true)}>Undo</button>
                  </form>
                </div>

                <div stype={{padding: 20}}>
                  Showing {issues.length} of {issues.length} issues.
                </div>

                <div className="grid justify-center items-center justify-items-center sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Displays each issue as an Issue object. */}
                    {issues.map((issue, index) => (
                        <Issue key={issue._id} index={index} data={issue} deleteHandler={openDeletePopup}/>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* The "add issue" popup - hidden until the user selects to add a new issue. */}
          {showAddPopup && (
              <AddIssuePopup closeHandler={() => setShowAddPopup(false)} clickHandler={addHandler} />
          )}
          {/* The "delete issue popup - hidden until the user selects to delete an issue." */}
          {showDeletePopup && (
            <DeleteIssuePopup closeHandler={() => setShowDeletePopup(false)} issue={selectedIssue} deleteHandler={deleteHandler}/>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="relative bg-primary shadow p-4 flex items-center justify-between">
        {/* Left: Logo and Hamburger */}
        <div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold focus:outline-none transition-transform transform hover:scale-105 hover:shadow-lg flex items-center space-x-2 inline lg:hidden">
            <Bars3Icon className="w-6 h-6" />
          </button>
          <span className="hidden lg:inline">
            <Logo className="truncate text-neutral xs:text-base md:text-lg lg:text-4xl" navigate={navigate} useClick={true} />
          </span>
        </div>

        {/* Center: Search Bar */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 border rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-primary-500 text-center"
          />
        </div>

        {/* Right: New Issue Button */}
        <div>
          <button onClick={() => setShowAddPopup(true)} className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold focus:outline-none transition-transform transform hover:scale-105 hover:shadow-lg flex items-center space-x-2">
            <PlusIcon className="w-6 h-6" />
            <span className="hidden lg:inline">New Issue</span>
          </button>
        </div>
      </header>

      <div className="flex flex-grow">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} navigate={navigate} />

        {/* Main Content */}
        <main className="flex-grow p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
            {issues.map((issue, index) => (
              <Issue
                key={issue._id}
                index={index}
                data={issue}
                deleteHandler={() => openDeleteHandler(issue)}
                openIssueModal={() => openIssueModal(issue)}
                className="bg-background shadow-md rounded-lg p-4 min-h-[200px] flex flex-col justify-between"
              />
            ))}
          </div>
        </main>
      </div>

      {showAddPopup && (
        <AddIssuePopup closeHandler={() => setShowAddPopup(false)}/>
      )}
      {showDeletePopup && (
        <DeleteIssuePopup closeHandler={() => setShowDeletePopup(false)} issue={selectedIssue}/>
      )}

      {isIssueModalOpen && (
        <IssueView
          issue={selectedIssue}
          onClose={closeIssueModal}
        />
      )}
    </div>
  );
};

export default Dashboard;
