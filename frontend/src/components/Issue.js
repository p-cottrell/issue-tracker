import React from "react";
import "./Issue.css";

export default function Issue({data, index, deleteHandler}) {
    return (
        <div className="container" style={{backgroundColor: index % 2 === 0 ? '#F1F1F1' : '#FFFFFF'}}>
            <div className="titleDescriptionContainer">
                <p>(ID: {data.key}) {data.title}</p>
                <p>Location: {data.location}</p>
                {data.description}
            </div>

            <div className="issueTimeContainer">
                <p>{data.date}</p>
                <button onClick={() => deleteHandler(data.key)}>Delete</button>
            </div>

        </div>
    )
}