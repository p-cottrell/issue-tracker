import React from "react";
import "./Issue.css";

export default function Issue({data, index, deleteHandler}) {
    return (
        <div className="container" style={{backgroundColor: index % 2 === 0 ? '#F1F1F1' : '#FFFFFF'}}>

            <div className="titleDescriptionContainer">
                <h3>(ID: {data.key}) {data.title}</h3>
                {data.description}
            </div>

            <div className="issueTimeContainer">
                <h4>{data.date}</h4>
                <button onClick={() => deleteHandler(data.key)}>Delete</button>
            </div>

        </div>
    )
}