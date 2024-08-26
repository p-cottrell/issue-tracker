import React from "react";
import "./Issue.css";



export default function Issue({ data, index, deleteHandler }) {
    const getStatusClass = () => {
        if (data.status_id === 1) return 'completed';
        if (data.status_id === 2) return 'in-progress';
        if (data.status_id === 3) return 'cancelled';
        return 'pending';  // Default class if status_id doesn't match 1, 2, or 3
    };

    const getStatusText = () => {
        if (data.status_id === 1) return 'Complete';
        if (data.status_id === 2) return 'In Progress';
        if (data.status_id === 3) return 'Cancelled';
        return 'Pending';  // Default value if status_id doesn't match 1, 2, or 3
    };
    return (
        <div className={`issue-container ${index % 2 === 0 ? 'even' : 'odd'}`}>
            {/* Status at the top-right corner */}
            <div className={`issue-status ${getStatusClass()}`}>
                {getStatusText()}
            </div>

            {/* Icon and Title */}
            <div className="issue-header">
                <div className="issue-icon">{data.charm}</div>
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