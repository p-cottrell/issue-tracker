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
import './Dashboard.css';
import Issue from '../../components/Issue';
import IssueView from '../../components/IssueView';
import Popup from '../../components/Popup';
import apiClient from '../../api/apiClient';

// .css imports
import '../../styles/base.css';
import '../../styles/loadingRing.css';

const Dashboard = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupHandler, setPopupHandler] = useState(() => () => {});
  const [popupType, setPopupType] = useState(null);
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showIssueView, setShowIssueView] = useState(false);

  //let index = 0; // Exists purely to make the rows of issues alternate between white and grey.
  const [fetched, setFetched] = useState(false); // Initialize to false
  let index = 0;

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
    setPopupType('add');
    setShowPopup(true);
    return;
  }

  // Opens the DELETE ISSUE popup
  function openDeleteHandler(data) {
    setPopupHandler(() => deleteHandler);
    setSelectedIssue(data);
    setPopupType('delete');
    setShowPopup(true);
    return;
  }

  // Handles when issues are clicked (should take the user to that issue's page)
  function clickIssueHandler(key) {
    return;
  }

  function clickHandler(key) {
    return;
  }
// show the issue view modal popup when the issue is clicked 
  const openIssueView = (issue) => {
    setSelectedIssue(issue); 
    setShowIssueView(true);  
  };

  // close the issue view modal popup
  const closeIssueView = () => {
    setShowIssueView(false); 
    setSelectedIssue(null);  
  };


  // Adds an issue to the DB.
  function addHandler(data) {
    let title = data.title;
    let description = data.description;
    let location = data.location;

    setShowPopup(false);

    // configure the API depending on the environment
    try {
      const response = apiClient.post(
        'api/issues',
        {
          title,
          description,
          location,
        },
        { withCredentials: true }
      );

      console.log('Issue added:', response.data);
      window.location.reload();
    } catch (error) {
      console.log('There was an error adding the issue:', error);
    }
  }

  // Deletes an issue from the DB.
  function deleteHandler(data) {
    // let id = data._id;
    setShowPopup(false);
    console.log(data._id, ' Deleted!');

    // // configure the API depending on the environment
    // const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    // try {
    //     const response = axios.delete(`${API_URL}/incidents`, {
    //     id,
    // }, {withCredentials: true});

    // console.log('Issue deleted:', response.data);

    // } catch (error) {
    //     console.log('There was an error deleting the issue:', error);
    // }
  }

  if (!fetched) {
    return (
      <div className="loading-container">
        <div className="loading-text">
          <div className="lds-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <h1>Intermittent Issue Tracker</h1>
        <h2>Track your issues effortlessly.</h2>

        <div className="user-info-container">
          <button
            name="add-issue"
            value="add-issue"
            className="add-button"
            onClick={openAddHandler}
          >
            + New Issue
          </button>
        </div>

        <div className="issues-container">
          {issues.map((issue) => {
            index++;
            return (
              <Issue
                key={issue._id} // Updated key to use issue._id
                index={index}
                data={issue}
                deleteHandler={openDeleteHandler}
                clickHandler={openIssueView} // Open IssueView on click
              />
            );
          })}
        </div>
      </div>

      {/* Popup for adding or deleting issues */}
      {showPopup ? (
        <Popup
          closeHandler={() => setShowPopup(false)}
          type={popupType}
          clickHandler={popupHandler}
          selectedIssue={selectedIssue}
        />
      ) : null}

      {/* Modal for viewing issue details */}
      {showIssueView && selectedIssue && (
        <IssueView
          issue={selectedIssue}
          onClose={closeIssueView}
        />
      )}
    </div>
  );
};

export default Dashboard;