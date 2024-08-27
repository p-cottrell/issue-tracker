// src/pages/issueview/IssueView.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './IssueView.css';

function IssueView() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/issues/${id}`, { withCredentials: true });
        setIssue(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching issue:', error);
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!issue) return <div className="not-found">Issue not found</div>;

  return (
    <div className="issue-popup">
      <div className="issue-header">
        <h1 className="issue-title">{issue.title}</h1>
        <p className="issue-charm">{issue.charm}</p>
        <p className="issue-status">Status: {issue.status_id}</p>
      </div>
      <div className="issue-body">
        <div className="issue-main">
          <h2>Description</h2>
          <p>{issue.description}</p>

          <h2>Occurrences</h2>
          <ul className="occurrences-list">
            {issue.occurrences.map((occurrence) => (
              <li key={occurrence._id} className="occurrence-item">
                <p><strong>Date:</strong> {new Date(occurrence.created_at).toLocaleString()}</p>
                <p><strong>Description:</strong> {occurrence.description}</p>
              </li>
            ))}
          </ul>

          <h2>Attachments</h2>
          <ul className="attachments-list">
            {issue.attachments.map((attachment) => (
              <li key={attachment._id} className="attachment-item">
                <a href={attachment.file_path} target="_blank" rel="noopener noreferrer" className="attachment-link">
                  {attachment.file_path.split('/').pop()}
                </a>
                <p><strong>Attached at:</strong> {new Date(attachment.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>

          <h2>Comments</h2>
          <ul className="comments-list">
            {issue.comments.map((comment) => (
              <li key={comment._id} className="comment-item">
                <p>{comment.comment_text}</p>
                <p><strong>Commented at:</strong> {new Date(comment.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="issue-sidebar">
          <div className="issue-meta">
            <p><strong>Reported by:</strong> {issue.reporter_id}</p>
            <p><strong>Created at:</strong> {new Date(issue.created_at).toLocaleString()}</p>
            <p><strong>Updated at:</strong> {new Date(issue.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IssueView;
