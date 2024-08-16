import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Dashboard.css";

const Dashboard = () => {
    const [incidents, setIncidents] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const response = await axios.get('http://localhost:5000/incident', { withCredentials: true });
                setIncidents(response.data);
            } catch (err) {
                setError('Error fetching incidents');
                console.error(err);
            }
        };

        fetchIncidents();
    }, []);

    return (
        <div className="home-wrapper">
            <div className="home-container">
                <h1>Welcome to the Intermittent Issue Tracker</h1>
                <p>Track your issues effortlessly.</p>
                {error && <p className="error">{error}</p>}
                <ul>
                    {incidents.map((incident) => (
                        <li key={incident._id}>
                            <h3>{incident.title}</h3>
                            <p>{incident.description}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;