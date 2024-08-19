import React from 'react';
import { useState} from 'react';
import "./Dashboard.css";
import axios from 'axios';
import Issue from '../../components/Issue';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// GET /api/issues: Retrieve the list of issues being tracked.

const Dashboard = () => {

    // Make an API request to the server to fetch incidents belonging to the logged in user.
    const response = axios.get(`${API_URL}/incidents/issues`)
    .then(res => {
        console.log(res.data.content)
    }).catch(err => {
        console.log(err)
    });
    console.log(response)

    // Placeholders to be replaced when sessions are implemented
    // const username = "bingus"
    const userID = "123456"

    // Required only to make issue items appear in rows of alternating colour
    let index = 0

    // Placeholder table of issues.
    const [issuesTable, setIssuesTable] = useState([
        {
           key: 0, userID: "123456", title: "network outages", occurrences: "none",
           description: "There was a network outage.", location: "home",
           date: "23:44:32 - 2024-08-12", 
        },
        {
            key: 1, userID: "456789", title: "network outages", occurrences: "none",
            description: "Different network outage at home.", location: "home",
            date: "01:09:02 - 2024-08-14", 
         },
         {
            key: 2, userID: "123456", title: "dog exploded", occurrences: "none",
            description: "The dog exploded and I feel the need to write an excessively long description about it so as to test this app.", location: "home",
            date: "11:49:56 - 2024-08-16", 
         },
         {
            key: 3, userID: "123456", title: "wife melted", occurrences: "none",
            description: "My wife melted again.", location: "wife melting room",
            date: "09:44:26 - 2024-08-17", 
         },
    ])

    function deleteHandler(key) {
        setIssuesTable(issuesTable.filter(issue => issue.key !== key))
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
                {issuesTable.map((data) => {
                    if (issuesTable.filter(issue => issue.userID === userID).length !== 0) { // If issue(s) belonging to this user still exist...
                        if (data.userID === userID) {
                            index++;
                            return (
                                <Issue key={data.key} index={index} data={data} deleteHandler={deleteHandler}/> // ... display the issue(s).
                            )
                        } else { return null }
                    } return null
                })}
                {issuesTable.filter(issue => issue.userID === userID).length === 0 ? <i>No issues found.</i> : null}
            </div>

            </div>
        </div>
    );
};

export default Dashboard;