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
    const [popupType, setPopupType] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [issues, setIssues] = useState([]);
    let index = 0;
    
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

    function addHandler() {
        setShowPopup(true);
        setPopupType("add");
    }

    function deleteHandler(data) {
        setShowPopup(true);
        setPopupType("delete");
        setSelectedIssue(data.title)
        return
    }

    function clickHandler(key) {
        return
    }
    
    return (
        <div className="home-wrapper">
            <div className="home-container">
                <h1>Intermittent Issue Tracker</h1>
                <p>Track your issues effortlessly.</p>

                <div className="user-info-container">
                    <button name="add-issue" value="add-issue" className="add-button" onClick={addHandler}>+ New Issue</button>
                    
                </div>

                <div className="issues-container">
                    {issues.map((incident) => {
                            index++;
                                return (
                                    <Issue key={incident.key} index={index} data={incident} deleteHandler={deleteHandler} clickHandler={clickHandler}/>
                                );
                        })}
                </div>
            </div>

            {showPopup ? <Popup closeHandler={() => setShowPopup(false)} type={popupType} selectedIssue={selectedIssue}/> : null}
        </div>
    );
    }

export default Dashboard;
