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
import apiClient from '../../api/apiClient';


// .css imports
import '../../styles/base.css';
import '../../styles/loadingRing.css';

const Dashboard = () => {
    const [issues, setIssues] = useState([]);
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

    if (!fetched) {
        return (
            <div className="loading-container">
                <div className="loading-text">
                    <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
                </div>
            </div>
        );
    }

    function deleteHandler(key) {
        // Placeholder for delete logic
    }

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-container">
                <h1>Intermittent Issue Tracker</h1>
                <h2>Track your issues effortlessly.</h2>

                <div className="user-info-container">
                    <button name="add-issue" value="add-issue" className="add-issue-button">+ New Issue</button>
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
