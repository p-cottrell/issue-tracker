import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './IssueView.css';

export default function IssueView({ issue, onClose }) {
  const [detailedIssue, setDetailedIssue] = useState(issue);
  const [editMode, setEditMode] = useState(false); // For toggling edit mode
  const [editedIssue, setEditedIssue] = useState({});
  const [newOccurrence, setNewOccurrence] = useState('');

  useEffect(() => {
    const fetchIssueDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/issues/${issue._id}`,
          {
            withCredentials: true,
          }
        );

        setDetailedIssue(response.data);
        setEditedIssue(response.data);
      } catch (error) {
        console.error('Error fetching issue details:', error);
      }
    };

    fetchIssueDetails();
  }, [issue._id]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/issues/${issue._id}`,
        editedIssue,
        {
          withCredentials: true,
        }
      );
      setDetailedIssue(response.data);
      console.log(response.data); // Log the new data
      setEditMode(false);
      alert('Issue updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating issue:', error);
      alert('Error updating issue');
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedIssue(detailedIssue); // Reset editedIssue to the original data
  };

  const handleAddOccurrence = async () => {
    if (!newOccurrence.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/issues/${issue._id}/occurrences`,
        { description: newOccurrence },
        { withCredentials: true }
      );
      setDetailedIssue({
        ...detailedIssue,
        occurrences: [...detailedIssue.occurrences, response.data.occurrence],
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

  return (
    <div className="modal-overlay">
      <div className="issue-view-modal">
        <button className="close-button" onClick={onClose}>
          X
        </button>
        <div className="modal-content">
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
                <h1 className="issue-title">{detailedIssue.title}</h1>
                <p className="issue-charm">{detailedIssue.charm}</p>
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
                detailedIssue.status_id
              )}
            </p>
            {!editMode && (
              <button onClick={handleEdit} className="edit-button">
                Edit Issue
              </button>
            )}
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
                <p>{detailedIssue.description}</p>
              )}

              <h2>Occurrences</h2>
              <ul className="occurrences-list">
                {(detailedIssue.occurrences || []).map((occurrence) => (
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
                {(detailedIssue.attachments || []).map((attachment) => (
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
                {(detailedIssue.comments || []).map((comment) => (
                  <li key={comment._id} className="comment-item">
                    <p>{comment.comment_text}</p>
                    <p>
                      <strong>Commented at:</strong>{' '}
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="issue-sidebar">
              <div className="issue-meta">
                <p>
                  <strong>Reported by:</strong> {detailedIssue.reporter_id}
                </p>
                <p>
                  <strong>Created at:</strong>{' '}
                  {new Date(detailedIssue.created_at).toLocaleString()}
                </p>
                <p>
                  <strong>Updated at:</strong>{' '}
                  {new Date(detailedIssue.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
