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
import { useNavigate } from 'react-router-dom'; // Import useNavigate
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

    const [showAddPopup, setShowAddPopup] = useState(false); // Controls whether the ADD ISSUE popup is visible.
    const [showDeletePopup, setShowDeletePopup] = useState(false); // Controls whether the DELETE ISSUE popup is visible.
    const [selectedIssue, setSelectedIssue] = useState(null); // For DELETE ISSUE to know which issue to delete.

    const [searchValue, setSearchValue] = useState(null);
    const [issuesBackup, setIssuesBackup] = useState([]);

    const [issues, setIssues] = useState([]);
    const [fetched, setFetched] = useState(false); // Initialize to false
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false); // State to track sidebar collapse
    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const response = await apiClient.get('api/issues');
                setIssues(response.data);
                setIssuesBackup(response.data)
                setFetched(true); // Set fetched to true after data is successfully fetched
            } catch (error) {
                console.error('Error fetching issues:', error);
                setFetched(true); // Set fetched to true to avoid infinite loading in case of an error
            }
        };

        fetchIssues();
    }, []);

    // Adds an issue to the DB.
    function addHandler(data) {
        let { title, description, attachment } = data;
        let charm = "c"; // PLACEHOLDER UNTIL DATABASE IS REVISED.
        setShowAddPopup(false); // Hide the popup again.

        const addIssue = async () => {
            try {
                const response = await apiClient.post('api/issues', {
                    title,
                    description,
                    charm,
                    attachment,
                });

                console.log('Issue added:', response);
                window.location.reload();
            } catch (error) {
                console.log('There was an error adding the issue:', error);
            }
        };
        addIssue();
    }

    // DELETE ISSUE is implemented as follows:
    // 1. Each Issue component is given the openDeletePopup handler. When that issue's delete button is clicked, openDeletePopup is called
    // and passed that issue's data.
    // 2. If the user confirms they want to delete this issue, the DeleteIssuePopup object calls deleteHandler, passing in the selected issue's data.
    // Deleting the issue could have been handled within the DeleteIssuePopup object rather than returning here; however, deleting the issue is handled here
    // in Dashboard.js because adding an issue is handled here - seemed better to keep similar functionality in one place.
    function openDeletePopup(data) {
      setSelectedIssue(data) // This allows the delete handler to know which issue to delete.
      setShowDeletePopup(true) // This displays the delete issue popup.
    }
    
    function deleteHandler(issue) {
      setShowDeletePopup(false) // This hides the delete issue popup.
      
      const id = issue._id;

      const deleteIssue = async () => {
          try {
              const response = await apiClient.delete(`api/issues/${id}`)
              console.log('Issue deleted:', response);
              window.location.reload();
          } catch (error) {
              console.log('There was an error deleting the issue:', error);
          }
        };
        deleteIssue();
    }

    function searchHandler(event, reset) {
      event.preventDefault(); // Prevent form submission

      if (reset) { // If "undo" was clicked...
        setIssues(issuesBackup)
      } else { // Otherwise, look for issues with the provided search value.
        const result = issues.filter((issue) => issue.title.toLowerCase().trim() === searchValue.toLowerCase().trim());
        result.length > 0 ? setIssues(result) : alert("not found");
      }
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
    );
}

export default Dashboard;