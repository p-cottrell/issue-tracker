import React from 'react';
import { useState, useEffect } from 'react';
import "./Dashboard.css";
// import axios from 'axios';
import Issue from '../../components/Issue';

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
// console.log(API_URL)

const Dashboard = () => {

    // function fetchIncidentData() {
    //     // Make an API request to the server to log in the user
    //     const response = axios.get(`${API_URL}/users`)
    //     .then(res => {
    //         console.log(res.data.content)
    //     }).catch(err => {
    //         console.log(err)
    //     });
    // };

    // fetchIncidentData();

    // Placeholders to be replaced when sessions are implemented
    const username = "bingus"
    const userID = "123456"

    // Required only to make issue items appear in rows of alternating colour
    let index = 0

    // Placeholder table of issues.
    const [issuesTable, setIssuesTable] = useState([
        {
           key: 0, userID: "123456", title: "network outages", occurrences: "none",
           description: "Network outage at home", location: "home",
           date: "23:44:32 - 2024-08-12", 
        },
        {
            key: 1, userID: "456789", title: "network outages", occurrences: "none",
            description: "Different network outage at home", location: "home",
            date: "01:09:02 - 2024-08-14", 
         },
         {
            key: 2, userID: "123456", title: "dog exploded", occurrences: "none",
            description: "The dog exploded", location: "home",
            date: "11:49:56 - 2024-08-16", 
         },
    ])

    function deleteHandler(key) {
        setIssuesTable(issuesTable.filter(issue => issue.key !== key))
        console.log("success")
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
                    if (issuesTable.filter(issue => issue.userID == userID) != 0) { // If issues belonging to this user still exist...
                        if (data.userID == userID) {
                            index++;
                            return (
                                <Issue key={data.key} index={index} data={data} deleteHandler={deleteHandler}/>
                            )
                        }
                    } else {
                        return (
                            <div><i>No issues found.</i></div>
                        )
                    }
                })}
            </div>

            </div>
        </div>
    );
};

export default Dashboard;