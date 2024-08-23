import React from "react";
import "./Issue.css";

export default function Issue({data, index, deleteHandler, clickHandler}) {
    let date = new Date(data.date).toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric"})

    return (
        <div className="container" style={{backgroundColor: index % 2 === 0 ? '#F1F1F1' : '#FFFFFF'}}>
            <div className="infoContainer" onClick={() => clickHandler(data._id)}>
                <div className="titleDescriptionContainer">
                    <p><strong>{data.title}</strong></p>
                    <p>Location: {data.location}</p>
                    {data.description}
                </div>

                <div className="issueTimeContainer">
                    <p>{date}</p>
                </div>
            </div>
            
            <div className="deleteContainer" onClick={() => deleteHandler(data)}>
                Delete
            </div>

        </div>
    )
}