import React, { useState, useEffect } from 'react';
import './IssueView.css';
import apiClient from '../api/apiClient';

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

const emojiOptions = ['🐞', '🚀', '⚠️'];

export default function IssueView({ issue, onClose }) {
  // State for the full issue details, separate from the initial 'issue' prop
  const [detailedIssue, setDetailedIssue] = useState(issue);
  // Toggle for edit mode
  const [editMode, setEditMode] = useState(false);
  // Separate state for edited issue to prevent direct mutation of detailedIssue
  const [editedIssue, setEditedIssue] = useState({
    ...issue,
    status_id: Number(issue.status_id),
  });

  // State for new occurrence input
  const [newOccurrence, setNewOccurrence] = useState('');

  // New state for occurrence editing
  const [selectedOccurrence, setSelectedOccurrence] = useState(null);

  const [editedOccurrence, setEditedOccurrence] = useState('');

  const [reporterName, setReporterName] = useState(''); // Reporter name

  const [editedCharm, setEditedCharm] = useState(issue.charm);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchIssueDetails = async () => {
      try {
        // Fetch full issue details
        const response = await apiClient.get(`/api/issues/${issue._id}`);
        setDetailedIssue(response.data);
        setEditedIssue(response.data);

        // Fetch the reporter's username after getting issue details
        if (response.data.reporter_id) {
          fetchReporterName(response.data.reporter_id);
        }
      } catch (error) {
        console.error('Error fetching issue details:', error);
      }
    };

    // Function to fetch reporter's username
    const fetchReporterName = async (reporterId) => {
      try {
        const response = await apiClient.get(`/api/users/${reporterId}`);
        if (response.data && response.data.username) {
          setReporterName(response.data.username); // Set the username from fetched user data
        } else {
          console.error('Reporter data not found or invalid format');
        }
      } catch (error) {
        console.error('Error fetching reporter name:', error);
      }
    };

    fetchIssueDetails();
  }, [issue._id]);

  const handleEdit = () => {
    setEditMode(true);
    setEditedIssue({ ...detailedIssue }); // Ensure we're working with a fresh copy
  };

  const showToast = (message, type, duration, onConfirm = null) => {
    setToast({ message, type, onConfirm, duration });
    if (!onConfirm) {
      setTimeout(() => setToast(null), duration);
    }
  };

  /**
  * Save the updated issue details to the backend.
  */
  const handleSave = async () => {
    try {
      // Prepare the data to be sent to the backend
      const dataToSend = {
        title: editedIssue.title,
        description: editedIssue.description,
        status_id: editedIssue.status_id,
        charm: editedCharm,
      };
  
      // Make the PUT request to update the issue
      console.log('Sending data to update issue:', dataToSend);
      const response = await apiClient.put(`/api/issues/${issue._id}`, dataToSend);
  
      // Update the detailed issue with the returned data
      setDetailedIssue(response.data.updatedIssue);
      setEditMode(false); // Exit edit mode
      showToast('Issue updated successfully', 'success', 5000);
  
      // Pass the updated issue data to the onClose function
      onClose(response.data.updatedIssue);
    } catch (error) {
      console.error('Error updating issue:', error);
      showToast('Error updating issue', 'error');
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
      const response = await apiClient.post(`/api/occurrences/${issue._id}`, {
        description: newOccurrence,
      });

      setDetailedIssue({
        ...detailedIssue,
        occurrences: [...detailedIssue.occurrences, response.data.occurrence],
      });
      setNewOccurrence('');
      showToast('Occurrence added successfully', 'success');
    } catch (error) {
      console.error(
        'Error adding occurrence:',
        error.response ? error.response.data : error.message
      );
      showToast(
        `Failed to add occurrence: ${
          error.response ? error.response.data.message : error.message
        }`,
        'error'
      );
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
        { description: editedOccurrence }
      );

      const updatedOccurrences = detailedIssue.occurrences.map((occ) =>
        occ._id === selectedOccurrence._id ? { ...response.data.occurrence, _id: occ._id } : occ
      );

      setDetailedIssue({
        ...detailedIssue,
        occurrences: updatedOccurrences,
      });
      setSelectedOccurrence(null);
      setEditedOccurrence('');
      showToast('Occurrence updated successfully', 'success');
    } catch (error) {
      console.error('Error updating occurrence:', error);
      showToast('Error updating occurrence', 'error');
    }
  };

  const handleDeleteOccurrence = async () => {
    if (!selectedOccurrence) return;
    showToast(
      'Are you sure you want to delete this occurrence?',
      'warning',
      0,
      async () => {
        try {
          const response = await apiClient.delete(
            `/api/occurrences/${issue._id}/${selectedOccurrence._id}`
          );

          const updatedIssue = response.data;
          console.log('Updated issue received from server:', updatedIssue);

          setDetailedIssue(updatedIssue);
          setEditedIssue(updatedIssue);
          setSelectedOccurrence(null);
          setEditedOccurrence('');

          showToast('Occurrence deleted successfully', 'success', 3000);
        } catch (error) {
          console.error('Error deleting occurrence:', error);
          showToast('Error deleting occurrence', 'error', 3000);
        }
      }
    );
  };

  const handleDelete = () => {
    showToast(
      'Are you sure you want to delete this issue?',
      'warning',
      0,
      async () => {
        try {
          await apiClient.delete(`/api/issues/${issue._id}`);
          showToast('Issue deleted successfully', 'success');
          onClose('deleted');
        } catch (error) {
          console.error('Error deleting issue:', error);
          showToast('Error deleting issue', 'error');
        }
      }
    );
  };

  const getStatusText = (statusId) => {
    switch (statusId) {
      case 0:
        return 'Pending';
      case 1:
        return 'Complete';
      case 2:
        return 'In Progress';
      case 3:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              {!editMode && (
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Edit
                </button>
              )}
              {editMode && (
                <>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1 bg-gray-500 text-white text-sm font-medium rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                onClick={handleDelete}
                className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="mt-2 px-7 py-3">
            {/* Issue header section */}
            <div className="issue-header">
              {editMode ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editedIssue.title}
                    onChange={(e) =>
                      setEditedIssue({ ...editedIssue, title: e.target.value })
                    }
                    className="text-xl font-bold mb-2 w-full p-2 border rounded h-[42px]"
                  />
                  <select
                    value={editedIssue.status_id}
                    onChange={(e) =>
                      setEditedIssue({
                        ...editedIssue,
                        status_id: Number(e.target.value),
                      })
                    }
                    className="p-2 border rounded h-[42px]"
                  >
                    <option value={0}>Pending</option>
                    <option value={1}>Complete</option>
                    <option value={2}>In Progress</option>
                    <option value={3}>Cancelled</option>
                  </select>
                  <select
                    value={editedCharm}
                    onChange={(e) => setEditedCharm(e.target.value)}
                    className="p-2 border rounded h-[42px]"
                  >
                    {emojiOptions.map((emoji, index) => (
                      <option key={index} value={emoji}>
                        {emoji}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold mb-2">{issue.title}</h1>
                  <p className="text-sm text-gray-600">
                    Status: {getStatusText(issue.status_id)}
                  </p>
                  <p className="text-2xl ml-2">{issue.charm}</p>
                  <p className="text-sm text-gray-600">
                    <strong>Issue ID:</strong> {issue._id}
                  </p>
                </>
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
                      className={`occurrence-item ${
                        selectedOccurrence &&
                        selectedOccurrence._id === occurrence._id
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() => handleSelectOccurrence(occurrence)}
                    >
                      <p>
                        <strong>ID:</strong> {occurrence._id}
                      </p>
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
                      <button
                        onClick={handleEditOccurrence}
                        className="save-occurrence-button"
                      >
                        Save Occurrence
                      </button>
                      <button
                        onClick={handleDeleteOccurrence}
                        className="delete-occurrence-button"
                      >
                        Delete Occurrence
                      </button>
                      <button
                        onClick={() => setSelectedOccurrence(null)}
                        className="cancel-edit-button"
                      >
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
                    <strong>Reported by:</strong>{' '}
                    {reporterName || detailedIssue.reporter_id}
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
          <div className="items-center px-4 py-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Close
            </button>
          </div>
        </div>
        {toast && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 max-w-sm w-full">
              <p
                className={`text-center mb-4 ${
                  toast.type === 'success'
                    ? 'text-green-600'
                    : toast.type === 'error'
                    ? 'text-red-600'
                    : toast.type === 'warning'
                    ? 'text-yellow-600'
                    : 'text-blue-600'
                }`}
              >
                {toast.message}
              </p>
              {toast.onConfirm ? (
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      toast.onConfirm();
                      setToast(null);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setToast(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setToast(null)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
