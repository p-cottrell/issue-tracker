import React from "react";
import './popup.css';

export default function Popup({closeHandler, type, selectedIssue}) {

    if (type == "add") {
        return (
            <div className="popup">
                <div className="popup-inner">
                    <div>
                        <center><h3>Add New Issue</h3></center>
                        <form>
                            <label for="title">Title:</label>
                            <input
                                type="text"
                                placeholder="Enter title"
                                id="title"
                                required
                            />
    
                            <label for="location">Location:</label>
                            <input
                                type="text"
                                placeholder="Enter location"
                                id="location"
                                required
                            />
    
                            <label for="description">Description:</label>
                            <input
                                type="text"
                                placeholder="Enter a description"
                                id="description"
                                required
                            />
    
                            <button type="submit">
                                + Add
                            </button>
    
                            <button onClick={closeHandler}>Cancel</button>
    
                        </form>
                    </div>
                </div>
            </div>
        )
    } else if (type == "delete") {
        return (
            <div className="popup">
                <div className="popup-inner">
                    <div>
                        <center><h3>"{selectedIssue}"</h3><h3>Are you sure you want to delete?</h3></center>
                        <form>
    
                            <button type="submit">
                                Delete
                            </button>
    
                            <button onClick={closeHandler}>Cancel</button>
    
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}