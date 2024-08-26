/**
 * React component to display a dashboard of issues
 *
 * This component fetches issues from an API and displays them in a list format.
 *
 * - Uses `axios` to make a GET request to `API_URL/incidents`, including cookies for authentication.
 * - The fetched data is stored in the `issues` state using `useState` hook.
 * - The `useEffect` hook is used to trigger the fetch operation when the component mounts.
 * - Each incident is displayed with its title, description, location, and formatted date.
 *
 * Usage:
 * - Import this component and include it in a parent component or route.
 * - Ensure the server endpoint and authentication are correctly configured.
 * - Add relevant CSS in `Dashboard.css` to style the component.
 *
 * @returns The rendered dashboard component.
 */

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import Issue from '../../components/Issue';
import Popup from '../../components/Popup';


const Dashboard = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [popupHandler, setPopupHandler] = useState(() => () => {});
    const [popupType, setPopupType] = useState(null);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [issues, setIssues] = useState([]);
    let index = 0; // Exists purely to make the rows of issues alternate between white and grey.
    
    useEffect(() => {
        // configure the API depending on the environment
        const API_URL = process.env.API_URL || 'http://localhost:5000';

        const fetchIncidents = async () => {
            try {
                const response = await axios.get(`${API_URL}/incidents`, {
                    withCredentials: true,
                });
                setIssues(response.data);
            } catch (error) {
                console.error('Error fetching issues:', error);
            }
        };

        fetchIncidents();
    }, []);

    // Opens the ADD ISSUE popup
    function openAddHandler() {
        setPopupHandler(() => addHandler)
        setPopupType("add");
        setShowPopup(true);
        return
    }

    // Opens the DELETE ISSUE popup
    function openDeleteHandler(data) {
        setPopupHandler(() => deleteHandler);
        setSelectedIssue(data)
        setPopupType("delete");
        setShowPopup(true);
        return
    }

    // Handles when issues are clicked (should take the user to that issue's page)
    function clickIssueHandler(key) {
        return
    }

    // Adds an issue to the DB.
    function addHandler(data) {
        let title = data.title;
        let description = data.description;
        let location = data.location;

        setShowPopup(false);

        // configure the API depending on the environment
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        try {
            const response = axios.post(`${API_URL}/incidents`, {
            title,
            description,
            location,
        }, {withCredentials: true});

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
        console.log(data._id, " Deleted!")
        
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
    
    return (
        <div className="home-wrapper">
            <div className="home-container">
                <h1>Intermittent Issue Tracker</h1>
                <p>Track your issues effortlessly.</p>

                <div className="user-info-container">
                    <button name="add-issue" value="add-issue" className="add-button" onClick={openAddHandler}>+ New Issue</button>
                    
                </div>

                {/* Displays all issues belonging to the logged-in user. */}
                <div className="issues-container">
                    {issues.map((incident) => {
                            index++;
                                return (
                                    <Issue key={incident._id} index={index} data={incident} deleteHandler={openDeleteHandler} clickHandler={clickIssueHandler}/>
                                );
                        })}
                </div>
            </div>

            {showPopup ? <Popup closeHandler={() => setShowPopup(false)} type={popupType} clickHandler={popupHandler} selectedIssue={selectedIssue}/> : null}
        </div>
    );
    }

export default Dashboard;
