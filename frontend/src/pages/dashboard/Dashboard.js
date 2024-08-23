import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import axios from 'axios';
import Issue from '../../components/Issue';

const Dashboard = () => {
    const [issues, setIssues] = useState([]);
    let index = 0;
    
    useEffect(() => {
        // configure the API depending on the environment
        const API_URL = process.env.API_URL || 'http://localhost:5000';
        console.log(`${API_URL}/incidents`)

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

    
    function deleteHandler(key) {
        return
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
                    {issues.map((incident) => {
                            index++;
                                return (
                                    <Issue key={incident.key} index={index} data={incident} deleteHandler={deleteHandler} />
                                );
                        })}
                </div>
            </div>
        </div>
    );
    }

export default Dashboard;