import { Bars3Icon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import AddIssuePopup from '../../components/AddIssuePopup';
import Issue from '../../components/Issue';
import Logo from '../../components/Logo';
import Sidebar from '../../components/Sidebar';
import IssueView from '../../components/IssueView';


// for status searching
const getStatusText = (status_id) => {
  switch (status_id) {
      case 1:
          return 'Complete';
      case 2:
          return 'In Progress';
      case 3:
          return 'Cancelled';
      default:
          return 'Pending';
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [popupHandler, setPopupHandler] = useState(() => () => { });
  const [popupType, setPopupType] = useState(null);
  const [issues, setIssues] = useState([]);
  const [fetched, setFetched] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [searchTerms, setSearchTerms] = useState({
    title: "",
    description: "",
    status: "",
  });
  const [allIssues, setAllIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await apiClient.get('api/issues');
        setAllIssues(response.data);
        setFilteredIssues(response.data);
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

  const openIssueModal = (issue) => {
    setSelectedIssue(issue);
    setIsIssueModalOpen(true);
  };

  const closeIssueModal = () => {
    setSelectedIssue(null);
    setIsIssueModalOpen(false);
  };

  const handleSearch = (field) => (event) => {
    const newSearchTerms = { ...searchTerms, [field]: event.target.value };
    setSearchTerms(newSearchTerms);

    const newFilteredIssues = allIssues.filter(issue => 
      (newSearchTerms.title === '' || (issue.title && issue.title.toLowerCase().includes(newSearchTerms.title.toLowerCase()))) &&
      (newSearchTerms.description === '' || (issue.description && issue.description.toLowerCase().includes(newSearchTerms.description.toLowerCase()))) &&
      (newSearchTerms.status === '' || (issue.status_id !== undefined && getStatusText(issue.status_id).toLowerCase() === newSearchTerms.status.toLowerCase()))
    );
    setFilteredIssues(newFilteredIssues);
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
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

        {/* Center: Search Bar Toggle */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <button
            onClick={toggleSearch}
            className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold focus:outline-none transition-transform transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
          >
            <MagnifyingGlassIcon className="w-6 h-6" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>

        {/* Right: New Issue Button */}
        <div>
          <button onClick={openAddHandler} className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold focus:outline-none transition-transform transform hover:scale-105 hover:shadow-lg flex items-center space-x-2">
            <PlusIcon className="w-6 h-6" />
            <span className="hidden lg:inline">New Issue</span>
          </button>
        </div>
      </header>

      {/* Collapsible Search Bar */}
      {isSearchExpanded && (
        <div className="bg-white shadow-md p-4 transition-all duration-300 ease-in-out">
          <div className="max-w-3xl mx-auto space-y-2">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerms.title}
              onChange={handleSearch('title')}
              className="px-4 py-2 border rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="Search by description..."
              value={searchTerms.description}
              onChange={handleSearch('description')}
              className="px-4 py-2 border rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <select
              value={searchTerms.status}
              onChange={handleSearch('status')}
              className="px-4 py-2 border rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="complete">Complete</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex flex-grow">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} navigate={navigate} />

        {/* Main Content */}
        <main className="flex-grow p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
            {filteredIssues.map((issue, index) => (
              <Issue
                key={issue._id}
                index={index}
                data={issue}
                deleteHandler={deleteHandler}
                openIssueModal={() => openIssueModal(issue)}
                className="bg-background shadow-md rounded-lg p-4 min-h-[200px] flex flex-col justify-between"
              />
            ))}
          </div>
        </main>
      </div>

      {showPopup && (
        <AddIssuePopup closeHandler={() => setShowPopup(false)} type={popupType} clickHandler={popupHandler} />
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
