import { Bars3Icon, PlusIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import AddIssuePopup from '../../components/AddIssuePopup';
import Issue from '../../components/Issue';
import Logo from '../../components/Logo';
import Sidebar from '../../components/Sidebar';
import IssueView from '../../components/IssueView';
import DeleteIssuePopup from '../../components/DeleteIssuePopup';
import { useUser } from '../../context/UserContext';

import '../../styles/base.css';
import '../../styles/loadingRing.css';

/**
 * Helper function to convert status_id to readable status text.
 * @param {number} status_id - The ID representing the status.
 * @returns {string} - The text representation of the status.
 */
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

/**
 * Dashboard component for displaying and managing issues.
 * Includes functionalities such as adding, deleting, searching, and filtering issues.
 * The component retrieves issues based on the authenticated user's context and filter preferences.
 */
const Dashboard = () => {
  const navigate = useNavigate(); // React Router hook for programmatic navigation
  const [showAddIssue, setShowAddIssue] = useState(false); // State to control visibility of the 'Add Issue' popup
  const [showDeleteIssue, setShowDeleteIssue] = useState(false); // State to control visibility of the 'Delete Issue' popup
  const [setPopupHandler] = useState(() => () => {}); // Handler function for different popups
  const [popupType, setPopupType] = useState(null); // Type of popup currently being displayed
  const [fetched, setFetched] = useState(false); // State to track if the issues have been fetched
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to control sidebar visibility
  const [selectedIssue, setSelectedIssue] = useState(null); // The issue selected for viewing or editing
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false); // State to control visibility of the 'Issue View' modal
  const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering issues
  const [noIssuesMessage, setNoIssuesMessage] = useState(''); // Holds message to display when no issues are found
  const [allIssues, setAllIssues] = useState([]); // All issues retrieved from the API
  const [filteredIssues, setFilteredIssues] = useState([]); // Issues filtered based on search term or filter type
  const [updateTrigger, setUpdateTrigger] = useState(0); // Trigger to force re-fetch of issues
  const [filterType, setFilterType] = useState(localStorage.getItem('filterType') || 'all'); // Filter type for issues, initialized from localStorage
  const [statusFilter, setStatusFilter] = useState('all'); // State for the status filter
  const { user } = useUser(); // Fetch authenticated user data from the context

  /**
   * Fetches issues from the API based on the filter type and user context.
   * Uses useCallback to memoize the function, preventing unnecessary re-fetching on re-renders.
   */
  const fetchIssues = useCallback(async () => {
    if (!user || !user.id) {
      console.error('User data is not available yet.');
      return;
    }

    setFetched(false); // Ensure UI shows loading wheel when fetching begins

    try {
      // Clear previous issues state
      setAllIssues([]);
      setFilteredIssues([]);
      setNoIssuesMessage(''); // Clear any existing messages

      let endpoint = 'api/issues'; // Default endpoint to fetch all issues
      if (filterType === 'myIssues' && user.id) {
        endpoint = `api/issues?userId=${user.id}`; // Fetch only issues reported by the current user
      }

      const response = await apiClient.get(endpoint); // Fetch issues from API

      if (response.data.success) {
        let issues = response.data.data;

        // Apply status filter
        if (statusFilter !== 'all') {
          issues = issues.filter((issue) => {
            // Extract the latest status_id from status_history
            const latestStatus = issue.status_history.length > 0 ? issue.status_history[issue.status_history.length - 1].status_id : null;
            return latestStatus === parseInt(statusFilter);
          });
        }

        setAllIssues(issues); // Set the issues data
        setFilteredIssues(issues);
        setNoIssuesMessage(''); // Clear any existing message
      } else {
        setNoIssuesMessage(response.data.message); // Display the message from the backend
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      setNoIssuesMessage('Error fetching issues. Please try again later.');
    } finally {
      setFetched(true); // Ensure UI shows that fetching is complete
    }
  }, [filterType, statusFilter, user]);


  /**
   * useEffect hook to fetch issues whenever the filter type, update trigger, or user context changes.
   */
  useEffect(() => {
    fetchIssues();
  }, [fetchIssues, updateTrigger]);

  /**
   * Handler to open the 'Add Issue' popup and set the appropriate handler and type.
   */
  const openAddHandler = () => {
    setPopupHandler(() => addHandler);
    setPopupType('add');
    setShowAddIssue(true);
  };

  /**
   * Adds a new issue via API call, triggered from the 'Add Issue' popup.
   * @param {Object} data - Contains title and description of the new issue.
   */
  const addHandler = (data) => {
    const { title, description } = data;
    const charm = '🐞'; // Default charm for new issues

    setShowAddIssue(false); // Close the 'Add Issue' popup

    const addIssue = async () => {
      try {
        const response = await apiClient.post('api/issues', {
          title,
          description,
          charm,
        });

        console.log('Issue added:', response.data);
        window.location.reload(); // Reload the page to reflect changes
      } catch (error) {
        console.log('There was an error adding the issue:', error);
      }
    };
    addIssue();
  };

  /**
   * Handler for deleting an issue.
   * @param {Object} data - Issue data to be deleted.
   */
  const deleteHandler = (data) => {
    setShowDeleteIssue(false);
    console.log(data._id, ' Deleted!');
  };

  /**
   * Opens the issue view modal to display details of the selected issue.
   * @param {Object} issue - The issue object to be displayed.
   */
  const openIssueModal = (issue) => {
    setSelectedIssue(issue);
    setIsIssueModalOpen(true);
  };

  /**
   * Closes the issue view modal and optionally triggers a re-fetch if the issue was updated.
   * @param {Object} updatedIssue - The updated issue object, if any.
   */
  const closeIssueModal = (updatedIssue) => {
    setSelectedIssue(null);
    setIsIssueModalOpen(false);
    if (updatedIssue) {
      setUpdateTrigger((prev) => prev + 1); // Increment trigger to force re-fetch
    }
  };

  /**
   * Handles user input for searching issues.
   * @param {Object} event - The event object from the search input.
   */
  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
  
    // Filter issues based on the search term and selected status
    const newFilteredIssues = allIssues.filter(
      (issue) =>
        (issue.title && issue.title.toLowerCase().includes(term)) ||
        (issue.description && issue.description.toLowerCase().includes(term)) ||
        (issue._id && issue._id.toLowerCase().includes(term)) ||
        (issue.status_id !== undefined && getStatusText(issue.status_id).toLowerCase().includes(term))
    );
  
    // Apply status filter
    const statusFilteredIssues = statusFilter === 'all' 
      ? newFilteredIssues 
      : newFilteredIssues.filter((issue) => issue.status_id === parseInt(statusFilter));
  
    setFilteredIssues(statusFilteredIssues);
  };

  /**
   * Handles changes in the filter type dropdown.
   * Saves the selected filter type to localStorage for persistence across sessions.
   * @param {Object} event - The event object from the filter dropdown.
   */
  const handleFilterChange = (event) => {
    const selectedFilter = event.target.value;
    setFilterType(selectedFilter);
    localStorage.setItem('filterType', selectedFilter); // Persist filter type to localStorage
  };

  // Return loading screen if issues have not been fetched yet
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

        {/* Search Bar */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
          <input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={handleSearch}
            className="px-4 py-2 border rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Right: New Issue Button */}
        <div className="flex items-center">
          <button
            onClick={openAddHandler}
            className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold focus:outline-none transition-transform transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
          >
            <PlusIcon className="w-6 h-6" />
            <span className="hidden lg:inline">New Issue</span>
          </button>
        </div>
      </header>

      <div className="flex flex-grow">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} navigate={navigate} />

        {/* Main Content */}
        <main className="flex-grow p-6">
          <div className="flex space-x-4 items-center mb-4">
            {/* Filter Dropdown */}
            <select
              onChange={handleFilterChange}
              value={filterType}
              className="bg-white text-primary-600 px-2 py-2 rounded-lg font-semibold focus:outline-none transition-transform transform hover:scale-105 hover:shadow-lg"
            >
              <option value="all">All Issues</option>
              <option value="myIssues">My Issues</option>
            </select>

            {/* Status Filter Dropdown */}
            <select
              onChange={(e) => setStatusFilter(e.target.value)} // Update the status filter
              value={statusFilter}
              className="bg-white text-primary-600 px-2 py-2 rounded-lg font-semibold focus:outline-none transition-transform transform hover:scale-105 hover:shadow-lg"
            >
              <option value="all">All Statuses</option>
              <option value="1">Complete</option>
              <option value="2">In Progress</option>
              <option value="3">Cancelled</option>
              <option value="0">Pending</option>
            </select>
          </div>
            {/* Display message if no issues found */}
            {noIssuesMessage && (
              <div className="flex justify-center items-center text-center text-red-500 mb-4 h-full">{noIssuesMessage}</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
              {filteredIssues.map((issue, index) => (
                <Issue
                  key={issue._id}
                  index={index}
                  data={issue}
                  deleteHandler={() => deleteHandler(issue)}
                  openIssueModal={() => openIssueModal(issue)}
                  className="bg-background shadow-md rounded-lg p-4 min-h-[200px] flex flex-col justify-between"
                />
              ))}
          </div>
        </main>
      </div>

      {showAddIssue && <AddIssuePopup closeHandler={() => setShowAddIssue(false)} />}

      {showDeleteIssue && (
        <DeleteIssuePopup closeHandler={() => setShowDeleteIssue(false)} issue={selectedIssue} />
      )}

      {isIssueModalOpen && <IssueView issue={selectedIssue} onClose={closeIssueModal} />}
    </div>
  );
};

export default Dashboard;
