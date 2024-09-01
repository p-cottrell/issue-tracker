/**
 * React component to display a dashboard of issues
 *
 * This component fetches issues from an API and displays them in a list format.
 *
 * - Uses apiClient to make a GET request to `API_URL/issues`
 * - The fetched data is stored in the `issues` state using `useState` hook.
 * - The `useEffect` hook is used to trigger the fetch operation when the component mounts.
 * - Each issue is displayed with its title, description, location, and formatted date.
 *
 * @returns The rendered dashboard component.
 */
import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Issue from '../../components/Issue';
import Popup from '../../components/Popup';
import apiClient from '../../api/apiClient';
import Header from '../../components/Header';
import LogoHeader from '../../components/LogoHeader';  // Import the new logo header

import '../../styles/base.css';
import '../../styles/loadingRing.css';

const Dashboard = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [popupHandler, setPopupHandler] = useState(() => () => {});
    const [popupType, setPopupType] = useState(null);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [issues, setIssues] = useState([]);
    const [fetched, setFetched] = useState(false); // Initialize to false
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false); // State to track sidebar collapse

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const response = await apiClient.get('api/issues');
                setIssues(response.data);
                setFetched(true); // Set fetched to true after data is successfully fetched
            } catch (error) {
                console.error('Error fetching issues:', error);
                setFetched(true); // Set fetched to true to avoid infinite loading in case of an error
            }
        };

        fetchIssues();
    }, []);

    // Opens the ADD ISSUE popup
    function openAddHandler() {
        setPopupHandler(() => addHandler);
        setPopupType("add");
        setShowPopup(true);
        return;
    }

    // Opens the DELETE ISSUE popup
    function openDeleteHandler(data) {
        setPopupHandler(() => deleteHandler);
        setSelectedIssue(data);
        setPopupType("delete");
        setShowPopup(true);
        return;
    }

    // Adds an issue to the DB.
    function addHandler(data) {
        let title = data.title;
        let description = data.description;
        let location = data.location;

        setShowPopup(false);

        try {
            const response = apiClient.post('api/issues', {
                title,
                description,
                location,
            });
            console.log('Issue added:', response.data);
            window.location.reload();
        } catch (error) {
            console.log('There was an error adding the issue:', error);
        }
    }

    // Deletes an issue from the DB.
    function deleteHandler(data) {
        setShowPopup(false);
        console.log(data._id, " Deleted!");
    }

    if (!fetched) {
        return (
          <div className="loading-container">
            <div className="loading-text">
              <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
            </div>
          </div>
        );
      }
    
      return (
        <div className="flex flex-col min-h-screen">
          {/* Fixed Logo Header */}
          <LogoHeader />
    
          {/* Adjust padding to prevent content overlap */}
          <div className="flex flex-grow pt-16"> {/* pt-16 to push content below the fixed logo header */}
            {/* Sidebar */}
            <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)} />
    
            {/* Main Content */}
            <div className={`flex-grow p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-[4rem]' : 'ml-[20rem]'}`}>
              <div className="w-full p-5 shadow-md rounded-lg">
                <div className="flex justify-end mb-4">
                  <button
                    className="py-2 px-4 bg-primary text-white rounded hover:bg-primaryHover focus:outline-none transition duration-150"
                    onClick={openAddHandler}
                  >
                    + New Issue
                  </button>
                </div>
                <div className="grid justify-center items-center justify-items-center sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {issues.map((issue, index) => (
                    <Issue key={issue._id} index={index} data={issue} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          {showPopup && (
            <Popup
              closeHandler={() => setShowPopup(false)}
              selectedIssue={selectedIssue}
            />
          )}
        </div>
      );
    };
    
    export default Dashboard;