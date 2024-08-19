import React from 'react';
import { useState, useEffect} from 'react';
import "./Dashboard.css";
import axios from 'axios';
import Issue from '../../components/Issue';
import { useParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// GET /api/issues: Retrieve the list of issues being tracked.

;
    function Dashboard() {
        
        const [issuesTable, setIssuesTable] = useState([]);
        const [error, setError] = useState(null);

        const userID = localStorage.getItem('userID');// get the userID from local storage
        const token = localStorage.getItem('token');// get the token from local storage
       
        let index = 0;
    
        useEffect(() => {
            if (!token) {
                setError("Token is missing. Please log in again.");
                return;
            }
    
            axios.get(`${API_URL}/incidents`, {
                headers: {
                    'Authorization': `Bearer ${token}` // this is passed to the server to authenticate the user, until paul changes it to cookies this works
                }
            })
            .then((response) => {
                setIssuesTable(response.data); // pulls data to the table/array
            })
            .catch((error) => {
                setError("Unable to fetch data for incidents");
            });
        }, [token]);
    
        function deleteHandler(key) {
            setIssuesTable(issuesTable.filter(issue => issue.key !== key));
        }
    
        return (
            <div className="home-wrapper">
                <div className="home-container">
                    <h1>Intermittent Issue Tracker</h1>
                    <p>Track your issues effortlessly.</p>
    
                    <div className="user-info-container">
                        <button name="add-issue" value="add-issue" className="add-button">+ New Issue</button>
                        
                    </div>
    
                    <div className="issues-container">
                        {issuesTable.filter(issue => issue.userID === userID).length !== 0 ? (
                            issuesTable.map((data) => {
                                if (data.userID === userID) {
                                    index++;
                                    return (
                                        <Issue key={data.key} index={index} data={data} deleteHandler={deleteHandler} />
                                    );
                                } else {
                                    return null;
                                }
                            })
                        ) : (
                            <i>No issues found. logged in as {userID}</i> //was using this to see what was being pulled in- was null for an extended period of time 
                        )}
                    </div>
                </div>
            </div>
        );
    }
    

export default Dashboard;