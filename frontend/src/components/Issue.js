import React from "react";
import "./Issue.css";

export default function Issue({ data, index, deleteHandler }) {
    return (
        <div className={`issue-container ${index % 2 === 0 ? 'even' : 'odd'}`}>
            {/* Status at the top-right corner */}
            <div className={`issue-status ${data.status === 'Completed' ? 'completed' : 'pending'}`}>
                {data.status || 'Pending'}
            </div>

            {/* Icon and Title */}
            <div className="issue-header">
                <img 
                    src="https://via.placeholder.com/32" 
                    alt="Issue Icon" 
                    className="issue-icon"
                />
                <h3 className="issue-title">{data.title}</h3>
            </div>

            {/* Date */}
            <p className="issue-date">
                <strong>Last reported on:</strong> {data.date}
            </p>

            {/* Description */}
            <p className="issue-description">
                <strong>Description:</strong> {data.description}
            </p>

            {/* Reference */}
            <p className="issue-reference">
                <strong>Reference:</strong> {data.key}
            </p>

            {/* Attachments */}
            <p className="issue-attachments">
                <strong>Attachment(s):</strong>
            </p>
            <img 
                src={data.image || 'https://via.placeholder.com/250x150'} 
                alt="Attachment" 
                className="issue-image"
            />

            {/* View more link */}
            <a href="#https://placehold.co/600x400" className="issue-view-more">
                View more
            </a>
        </div>
    );
}