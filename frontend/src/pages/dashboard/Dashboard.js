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
import Popup from '../../components/Popup';
import apiClient from '../../api/apiClient';


// .css imports
import '../../styles/base.css';
import '../../styles/loadingRing.css';
import { useNavigate } from 'react-router-dom';


const Dashboard = () => {
    const navigate = useNavigate();

    const [showPopup, setShowPopup] = useState(false);
    const [popupHandler, setPopupHandler] = useState(() => () => {});
    const [popupType, setPopupType] = useState(null);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [issues, setIssues] = useState([]);

    //let index = 0; // Exists purely to make the rows of issues alternate between white and grey.
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

    function clickHandler(key) {
        return
    }

    // Adds an issue to the DB.
    function addHandler(data) {
        let title = data.title;
        let description = data.description;
        let charm = "c";

        console.log(title, description, charm, "pingus")

        setShowPopup(false);

        const addIssue = async () => {
            try {
                const response = await apiClient.post('api/issues', {
                    title,
                    description,
                    charm,
                });
    
                console.log('Issue added:', response.data);
                window.location.reload();
            } catch (error) {
                console.log('There was an error adding the issue:', error);
            }
        };
        addIssue();
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

    if (!fetched) {
        return (
            <div className="loading-container">
                <div className="loading-text">
                    <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-container">
                <h1>Intermittent Issue Tracker</h1>
                <h2>Track your issues effortlessly.</h2>

                <div className="user-info-container">
                <button name="add-issue" value="add-issue" className="add-button" onClick={openAddHandler}>+ New Issue</button>
                </div>

                <div className="issues-container">
                    {issues.map((issue) => {
                        index++;
                        return (
                            <Issue key={issue._id} index={index} data={issue} deleteHandler={deleteHandler} clickHandler={clickHandler}/>
                        );
                    })}
                </div>
            </div>
            {showPopup ? <Popup closeHandler={() => setShowPopup(false)} type={popupType} clickHandler={popupHandler} selectedIssue={selectedIssue}/> : null}
        </div>
    );
}

export default Dashboard;
