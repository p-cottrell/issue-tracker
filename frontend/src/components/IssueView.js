import React, { useEffect, useState } from 'react';
import './IssueView.css';
import apiClient from '../api/apiClient'

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export default function IssueView({ issue, onClose }) {
  // State for the full issue details, separate from the initial 'issue' prop
  const [detailedIssue, setDetailedIssue] = useState(issue);
  // Toggle for edit mode
  const [editMode, setEditMode] = useState(false);
  // Separate state for edited issue to prevent direct mutation of detailedIssue
  const [editedIssue, setEditedIssue] = useState({});
  // State for new occurrence input
  const [newOccurrence, setNewOccurrence] = useState('');

  // New state for occurrence editing
  const [selectedOccurrence, setSelectedOccurrence] = useState(null);
  
  const [editedOccurrence, setEditedOccurrence] = useState('');

  useEffect(() => {
    // Fetch full issue details when component mounts or issue ID changes
    const fetchIssueDetails = async () => {
      try {
        const response = await apiClient.get(
          `/api/issues/${issue._id}`,
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
      // Send PUT request to update the issue
      const response = await apiClient.put(
        `/api/issues/${issue._id}`,
        editedIssue,
      );
      setDetailedIssue(response.data);
      setEditMode(false);
      alert('Issue updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating issue:', error);
      alert('Error updating issue');
    }
  };

  const handleCancel = () => {
    // Reset edited issue to original state and exit edit mode
    setEditMode(false);
    setEditedIssue(detailedIssue);
  };

  const handleAddOccurrence = async () => {
    if (!newOccurrence.trim()) return;

    try {
      // Send POST request to add new occurrence
      const response = await apiClient.post(
        `/api/occurrences/${issue._id}`,
        { description: newOccurrence },
      );

      setDetailedIssue({
        ...detailedIssue,
        occurrences: [...detailedIssue.occurrences, response.data.occurrence],
      });
      setNewOccurrence('');
      alert('Occurrence added successfully');
    } catch (error) {
      console.error('Error adding occurrence:', error.response ? error.response.data : error.message);
      alert(`Failed to add occurrence: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedIssue({ ...editedIssue, [name]: value });
  };

  const handleSelectOccurrence = (occurrence) => {
    setSelectedOccurrence(occurrence);
    setEditedOccurrence(occurrence.description);
  };

  const handleEditOccurrence = async () => {
    if (!selectedOccurrence || !editedOccurrence.trim()) return;

    try {
      const response = await apiClient.put(
        `/api/occurrences/${issue._id}/${selectedOccurrence._id}`,
        { description: editedOccurrence },
      );

      const updatedOccurrences = detailedIssue.occurrences.map(occ =>
        occ._id === selectedOccurrence._id ? response.data.occurrence : occ
      );

      setDetailedIssue({
        ...detailedIssue,
        occurrences: updatedOccurrences,
      });
      setSelectedOccurrence(null);
      setEditedOccurrence('');
      alert('Occurrence updated successfully');
    } catch (error) {
      console.error('Error updating occurrence:', error);
      alert('Error updating occurrence');
    }
  };

  const handleDeleteOccurrence = async () => {
    if (!selectedOccurrence) return;
    console.log(selectedOccurrence._id);

    
    try {
      await apiClient.delete(
        `/api/occurrences/${issue._id}/${selectedOccurrence._id}`,
      );

      const updatedOccurrences = detailedIssue.occurrences.filter(
        occ => occ._id !== selectedOccurrence._id
      );

      setDetailedIssue({
        ...detailedIssue,
        occurrences: updatedOccurrences,
      });
      setSelectedOccurrence(null);
      setEditedOccurrence('');
      alert('Occurrence deleted successfully');
    } catch (error) {
      console.error('Error deleting occurrence:', error);
      alert('Error deleting occurrence');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="issue-view-modal">
        <button className="close-button" onClick={onClose}>
          X
        </button>
        <div className="modal-content">
          {/* Issue header section */}
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
              // Render title and charm in view mode
              <>
                <h1 className="issue-title">{detailedIssue.title}</h1>
                <p className="issue-charm">{detailedIssue.charm}</p>
              </>
            )}
            {/* Status display/edit */}
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
            {/* Edit/Save/Cancel buttons */}
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
          {/* Issue body section */}
          <div className="issue-body">
            <div className="issue-main">
              {/* Description section */}
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

              {/* Occurrences section */}
              <h2>Occurrences</h2>
              <ul className="occurrences-list">
                {(detailedIssue.occurrences || []).map((occurrence) => (
                  <li 
                    key={occurrence._id} 
                    className={`occurrence-item ${selectedOccurrence && selectedOccurrence._id === occurrence._id ? 'selected' : ''}`}
                    onClick={() => handleSelectOccurrence(occurrence)}
                  >
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

              {/* Occurrence edit section */}
              {selectedOccurrence && (
                <div className="occurrence-edit">
                  <textarea
                    value={editedOccurrence}
                    onChange={(e) => setEditedOccurrence(e.target.value)}
                    className="edit-occurrence-input"
                  />
                  <div className="occurrence-edit-buttons">
                    <button onClick={handleEditOccurrence} className="save-occurrence-button">
                      Save Occurrence
                    </button>
                    <button onClick={handleDeleteOccurrence} className="delete-occurrence-button">
                      Delete Occurrence
                    </button>
                    <button onClick={() => setSelectedOccurrence(null)} className="cancel-edit-button">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* New occurrence input */}
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

              {/* Attachments section */}
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

              {/* Comments section */}
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
            {/* Issue sidebar with metadata */}
            <div className="issue-sidebar">
              <div className="issue-meta">
                <p>
                  <strong>Reported by:</strong> {detailedIssue.reporter_id}
                </p>
                <p>
                  <strong>Created at:</strong>{' '}
                  {formatDate(detailedIssue.created_at)}
                </p>
                <p>
                  <strong>Updated at:</strong>{' '}
                  {formatDate(detailedIssue.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
