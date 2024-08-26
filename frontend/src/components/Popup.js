import React from "react";
import { useState } from "react";
import './popup.css';

export default function Popup({closeHandler, selectedIssue, clickHandler, type}) {
    
    // State variables for ADD
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');

    function addHandler(event) {
        clickHandler({title: title, location: location, description: description});
    }
    
    if (type === "add") { // Form for adding a new issue.
        return (
            <div className="popup">
                <div className="popup-inner">
                    <form id="addForm" onSubmit={addHandler}>
                        <h3>Add New Issue</h3>
                        <div>
                            <label>Title:</label>
                            <input 
                                type="text"
                                id="title"
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Location:</label>
                            <input 
                                type="text" 
                                id="location"
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Description:</label>
                            <input
                                type="text"
                                id="description"
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <button type="submit">+ Add</button>
                        <button onClick={closeHandler}>Cancel</button>
                    </form>
                </div>
            </div>
        )
    } else if (type === "delete") { // For deleting an issue.
        return (
            <div className="popup">
                 <div className="popup-inner">
                     <div>
                         <center><h3>"{selectedIssue.title}"</h3><h3>Are you sure you want to delete?</h3></center>
                         <button onClick={() => clickHandler(selectedIssue)}>Delete</button>
                         <button onClick={closeHandler}>Cancel</button>
                     </div>
                 </div>
             </div>
        )
    }
}