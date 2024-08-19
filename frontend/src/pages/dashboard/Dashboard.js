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

const Dashboard = () => {
    const [issues, setIssues] = useState([]);

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

    return (
        <div className="home-wrapper">
            <div className="home-container">
                <h1>Welcome to the Intermittent Issue Tracker</h1>
                <p>Track your issues effortlessly.</p>
                <ul>
                    {issues.map(incident => (
                        <li key={incident._id}>
                            <h3>{incident.title}</h3>
                            <p><strong>Description:</strong> {incident.description}</p>
                            <p><strong>Location:</strong> {incident.location}</p>
                            <p><strong>Date:</strong> {new Date(incident.date).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;