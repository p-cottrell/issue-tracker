
import React from 'react';

// .css imports
import "./Issue.css";
import "../styles/loadingRing.css"

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

export default function Issue({ data, deleteHandler }) {

    // This takes the status id and gives it a class name for colouring
    const getStatusClass = () => {
        if (data.status_id === 1) return 'completed';
        if (data.status_id === 2) return 'in-progress';
        if (data.status_id === 3) return 'cancelled';
        return 'pending';  // Default class if status_id doesn't match 1, 2, or 3
    };

    // This takes the staus id and assigns it a status
    const getStatusText = () => {
        if (data.status_id === 1) return 'Complete';
        if (data.status_id === 2) return 'In Progress';
        if (data.status_id === 3) return 'Cancelled';
        return 'Pending';  // Default value if status_id doesn't match 1, 2, or 3
    };

    return (
        <div className={`issue-container`}>
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
                <strong>Issue Created:</strong> {formatDate(data.created_at)}
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
                src={data.image || 'https://loremflickr.com/250/150/kitten' }
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