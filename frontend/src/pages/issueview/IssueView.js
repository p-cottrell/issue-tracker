// src/pages/issueview/IssueView.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './IssueView.css';

function IssueView() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false); // Track if the user can edit the issue
  const [editMode, setEditMode] = useState(false); // Controls whether we are in edit mode or not
  const [editedIssue, setEditedIssue] = useState({}); // Stores the edited values
  const [newOccurrence, setNewOccurrence] = useState('');

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/issues/${id}`,
          { withCredentials: true }
        );
        setIssue(response.data.issue);
        setEditedIssue(response.data.issue); // Initialize edited issue with current issue data
        setCanEdit(response.data.canEdit); // Set canEdit based on API response
        setLoading(false);
      } catch (error) {
        console.error('Error fetching issue:', error);
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/issues/${id}`, editedIssue, {
        withCredentials: true,
      });
      setEditMode(false);
      setIssue(editedIssue);
      alert('Issue updated successfully');
    } catch (error) {
      console.error('Error updating issue:', error);
      alert('Error updating issue');
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedIssue(issue);
  };

  const handleAddOccurrence = async () => {
    if (!newOccurrence.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/issues/${id}/occurrences`,
        { description: newOccurrence },
        { withCredentials: true }
      );
      setIssue({
        ...issue,
        occurrences: [...issue.occurrences, response.data.occurrence],
      });
      setNewOccurrence(''); // Clear the input field
      alert('Occurrence added successfully');
    } catch (error) {
      console.error('Error adding occurrence:', error);
      alert('Failed to add occurrence');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedIssue({ ...editedIssue, [name]: value });
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!issue) return <div className="not-found">Issue not found</div>;

  return (
    <div className="issue-popup">
      <div className="issue-header">
        {editMode ? (
          <>
            <input
              type="text"
              name="title"
              value={editedIssue.title}
              onChange={handleInputChange}
              className="issue-title-input"
            />
            <input
              type="text"
              name="charm"
              value={editedIssue.charm}
              onChange={handleInputChange}
              className="issue-charm-input"
            />
          </>
        ) : (
          <>
            <h1 className="issue-title">{issue.title}</h1>
            <p className="issue-charm">{issue.charm}</p>
          </>
        )}
        <p className="issue-status">
          Status:{' '}
          {editMode ? (
            <input
              type="number"
              name="status_id"
              value={editedIssue.status_id}
              onChange={handleInputChange}
              className="issue-status-input"
            />
          ) : (
            issue.status_id
          )}
        </p>
        {canEdit && !editMode && (
          <button onClick={handleEdit} className="edit-button">
            Edit Issue
          </button>
        )}
      </div>
      <div className="issue-body">
        <div className="issue-main">
          <h2>Description</h2>
          {editMode ? (
            <textarea
              name="description"
              value={editedIssue.description}
              onChange={handleInputChange}
              className="issue-description-textarea"
            />
          ) : (
            <p>{issue.description}</p>
          )}

          <h2>Occurrences</h2>
          <ul className="occurrences-list">
            {issue.occurrences.map((occurrence) => (
              <li key={occurrence._id} className="occurrence-item">
                <p>
                  <strong>Date:</strong>{' '}
                  {new Date(occurrence.created_at).toLocaleString()}
                </p>
                <p>
                  <strong>Description:</strong> {occurrence.description}
                </p>
              </li>
            ))}
          </ul>
          <textarea
            placeholder="Add new occurrence"
            value={newOccurrence}
            onChange={(e) => setNewOccurrence(e.target.value)}
            className="new-occurrence-input"
          />
          <button
            onClick={handleAddOccurrence}
            className="add-occurrence-button"
          >
            Add Occurrence
          </button>

          <h2>Attachments</h2>
          <ul className="attachments-list">
            {issue.attachments.map((attachment) => (
              <li key={attachment._id} className="attachment-item">
                <a
                  href={attachment.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="attachment-link"
                >
                  {attachment.file_path.split('/').pop()}
                </a>
                <p>
                  <strong>Attached at:</strong>{' '}
                  {new Date(attachment.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>

          <h2>Comments</h2>
          <ul className="comments-list">
            {issue.comments.map((comment) => (
              <li key={comment._id} className="comment-item">
                <p>{comment.comment_text}</p>
                <p>
                  <strong>Commented at:</strong>{' '}
                  {new Date(comment.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>

          {editMode && (
            <div className="edit-buttons">
              <button onClick={handleSave} className="save-button">
                Save
              </button>
              <button onClick={handleCancel} className="cancel-button">
                Cancel
              </button>
            </div>
          )}
        </div>
        <div className="issue-sidebar">
          <div className="issue-meta">
            <p>
              <strong>Reported by:</strong> {issue.reporter_id}
            </p>
            <p>
              <strong>Created at:</strong>{' '}
              {new Date(issue.created_at).toLocaleString()}
            </p>
            <p>
              <strong>Updated at:</strong>{' '}
              {new Date(issue.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IssueView;
