/**
 * React component to display a dashboard of issues
 *
 * This component fetches issues from an API and displays them in a list format.
 *
 * - Uses `axios` to make a GET request to `API_URL/issues`, including cookies for authentication.
 * - The fetched data is stored in the `issues` state using `useState` hook.
 * - The `useEffect` hook is used to trigger the fetch operation when the component mounts.
 * - Each issue is displayed with its title, description, location, and formatted date.
 *
 *
 * @returns The rendered dashboard component.
 */
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


        const fetchIssues = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/issues`, {
                    withCredentials: true,
                });
                setIssues(response.data);
            } catch (error) {
                console.error('Error fetching issues:', error);
            }
        };

        fetchIssues();
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
                    {issues.map((issue) => {
                            index++;
                                return (
                                    <Issue key={issue.key} index={index} data={issue} deleteHandler={deleteHandler} />
                                );
                        })}
                </div>
            </div>
        </div>
    );
    }

export default Dashboard;
