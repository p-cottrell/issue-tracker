import React, { useCallback, useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { useUser } from "../context/UserContext";
import { generateNiceReferenceId } from '../helpers/IssueHelpers';
import "./IssueView.css";

// Helper function to format date in DD/MM/YYYY format
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

// Helper function to format dates in a "smart" way (e.g., "just now", "1 hr ago")
function formatSmartDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? '1 min ago' : `${diffInMinutes} mins ago`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hr ago' : `${diffInHours} hrs ago`;
  } else if (diffInDays === 1) {
    return 'yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return formatDate(dateString);
  }
}

// Array of emoji options for the charm selector
const emojiOptions = [
  '⚠️', '🚀', '🐞', '💻', '📅', '🌐', '🏆', '🏠', '🐈', '🐕', '⏱️', '🎵',
  '⭐', '🔎', '📸', '💾', '❤️', '🎬', '📖', '🎂', '🖥️', '🔥', '🎫', '🔧',
  '🚫', '💥', '🎓', '📚'
];

export default function IssueView({ issue, onClose }) {
  const { user } = useUser();

  // State variables
  const [detailedIssue, setDetailedIssue] = useState(issue); // Detailed issue data
  const [editMode, setEditMode] = useState(false); // Toggle for edit mode
  const [editedIssue, setEditedIssue] = useState({ ...issue }); // Copy of issue for editing
  const [editedCharm, setEditedCharm] = useState(issue.charm); // Edited charm (emoji)
  const [currentStatus, setCurrentStatus] = useState(() => {
    // Initialize currentStatus based on the latest status in status_history
    if (issue.status_history && issue.status_history.length > 0) {
      return issue.status_history[issue.status_history.length - 1].status_id;
    }
    return null; // Default to null if no status_history
  });
  const [canEdit, setCanEdit] = useState(false); // Permission to edit
  const [isAdmin, setIsAdmin] = useState(false); // Check if user is admin

  // State for occurrences
  const [newOccurrence, setNewOccurrence] = useState(""); // New occurrence input
  const [selectedOccurrence, setSelectedOccurrence] = useState(null); // Selected occurrence for editing
  const [editedOccurrence, setEditedOccurrence] = useState(""); // Edited occurrence text

  // State for comments
  const [newComment, setNewComment] = useState(""); // New comment input
  const [selectedComment, setSelectedComment] = useState(null); // Selected comment for editing
  const [editedComment, setEditedComment] = useState(""); // Edited comment text

  // Other states
  const [toast, setToast] = useState(null); // Toast notification state
  const [username, setUserName] = useState(""); // Reporter's username
  const [attachments, setAttachments] = useState([]); // List of attachments
  const [attachmentError, setAttachmentError] = useState(null); // Attachment error message
  const [images, setImages] = useState([]); // Selected images for upload
  const [imagePreviews, setImagePreviews] = useState([]); // Image preview URLs
  const [isDragging, setIsDragging] = useState(false); // Drag-and-drop state
  const [previewImage, setPreviewImage] = useState(null); // Preview image state

  // Function to display toast notifications
  const showToast = (message, type, duration = 5000, onConfirm = null) => {
    setToast({ message, type, onConfirm, duration });
    if (!onConfirm) {
      setTimeout(() => setToast(null), duration);
    }
  };


  // Fetch issue details from the server
  const fetchIssueDetails = useCallback(async () => {
    try {
      const response = await apiClient.get(`/api/issues/${issue._id}`);
      const fetchedIssue = response.data;
      setDetailedIssue(fetchedIssue);
      setEditedIssue({ ...fetchedIssue }); // Update editedIssue with fetched data
      setEditedCharm(fetchedIssue.charm); // Update editedCharm

      // Set reporter's username

      fetchUsername(response.data.reporter_id);
      fetchAttachments(); // Fetch attachments if necessary
    } catch (error) {
      console.error('Error fetching issue details:', error);
      showToast('Error fetching issue details', 'error');
    }
  }, [issue._id]);



  const fetchUsername = async (reporterId) => {
    try {
      const response = await apiClient.get(`/api/users/${reporterId}`);
      const reporter = response.data;
      setUserName(reporter.username); // Set reporter's username
    } catch (error) {
      console.error('Error fetching reporter username:', error);
      showToast('Error fetching reporter username', 'error');
    }
  };

  // Fetch attachments for the issue
  const fetchAttachments = async () => {
    try {
      const response = await apiClient.get(`/api/attachments/${issue._id}`);
      setAttachments(response.data);
      setAttachmentError(null);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      setAttachmentError('Failed to load attachments. Please try again later.');
    }
  };

  // useEffect to fetch issue details on component mount or when issue ID changes
  useEffect(() => {
    fetchIssueDetails();

    // Set permissions based on user role and issue reporter
    const userCanEdit = user.role === 'admin' || user.id === issue.reporter_id;
    setCanEdit(userCanEdit);
    setIsAdmin(user.role === 'admin');
  }, [issue._id, user, fetchIssueDetails, issue.reporter_id]);

  // useEffect to update currentStatus when detailedIssue changes
  useEffect(() => {
    if (detailedIssue.status_history && detailedIssue.status_history.length > 0) {
      setCurrentStatus(
        detailedIssue.status_history[detailedIssue.status_history.length - 1].status_id
      );
    } else {
      setCurrentStatus(null); // Or set to a default status ID if desired
    }
  }, [detailedIssue]);

  // Function to handle entering edit mode
  const handleEdit = () => {
    if (canEdit) {
      setEditMode(true);
      setEditedIssue({ ...detailedIssue }); // Set editedIssue to current detailedIssue
      setEditedCharm(detailedIssue.charm); // Set editedCharm to current charm
      // Set currentStatus to the latest status_id from detailedIssue
      if (detailedIssue.status_history && detailedIssue.status_history.length > 0) {
        setCurrentStatus(
          detailedIssue.status_history[detailedIssue.status_history.length - 1].status_id
        );
      } else {
        setCurrentStatus(null); // Or a default status if needed
      }
    }
  };

  // Function to handle saving edits
  const handleSave = async () => {
    if (canEdit) {
      try {
        // Prepare updated issue data
        const updatedIssue = {
          ...editedIssue,
          charm: editedCharm,
          status_id: currentStatus,
          status_history: [
            ...editedIssue.status_history,
            { status_id: currentStatus, date: new Date() },
          ],
          updated_at: new Date().toISOString(),
        };

        // Prepare data to send to the backend
        const dataToSend = {
          ...updatedIssue,
          occurrences: updatedIssue.occurrences.map((occurrence) => ({
            ...occurrence,
            user_id: occurrence.user_id || user.id,
          })),
        };

        // Send PUT request to update the issue
        const response = await apiClient.put(`/api/issues/${issue._id}`, dataToSend);

        setDetailedIssue(response.data.updatedIssue); // Update detailedIssue with response
        setEditMode(false); // Exit edit mode
        showToast('Issue updated successfully', 'success', 5000);

        onClose(response.data.updatedIssue); // Close the issue view with updated data
      } catch (error) {
        console.error('Error updating issue:', error);
        showToast('Error updating issue', 'error');
      }
    }
  };

  // Function to handle canceling edits
  const handleCancel = () => {
    if (canEdit) {
      setEditMode(false);
      setEditedIssue(detailedIssue); // Revert changes
      setEditedCharm(detailedIssue.charm); // Revert charm
      // Reset currentStatus to match detailedIssue
      if (detailedIssue.status_history && detailedIssue.status_history.length > 0) {
        setCurrentStatus(
          detailedIssue.status_history[detailedIssue.status_history.length - 1].status_id
        );
      } else {
        setCurrentStatus(null);
      }
    }
  };

  // Function to handle input changes in edit mode
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'status_id') {
      const statusId = Number(value);
      setCurrentStatus(statusId); // Update currentStatus
      setEditedIssue({
        ...editedIssue,
        status_id: statusId,
        status_history: [
          ...editedIssue.status_history,
          { status_id: statusId, date: new Date() },
        ],
      });
    } else {
      setEditedIssue({ ...editedIssue, [name]: value });
    }
  };

  // Function to get the status text based on status ID
  const getStatusText = (statusId) => {
    switch (statusId) {
      case 1:
        return 'Complete';
      case 2:
        return 'In Progress';
      case 3:
          return 'Cancelled';
      case 4:
          return 'Pending';
      default:
          return 'Unknown';
    }
  };

  // Functions for handling occurrences

  // Add a new occurrence
  const handleAddOccurrence = async () => {
    if (!newOccurrence.trim()) return;

    try {
      const response = await apiClient.post(`/api/occurrences/${issue._id}`, {
        description: newOccurrence,
        user_id: user.id,
      });

      setDetailedIssue({
        ...detailedIssue,
        occurrences: [...detailedIssue.occurrences, response.data.occurrence],
      });
      setNewOccurrence("");
      showToast("Occurrence added successfully", "success");
    } catch (error) {
      console.error("Error adding occurrence:", error);
      showToast("Failed to add occurrence", "error");
    }
  };

  // Select an occurrence for editing
  const handleSelectOccurrence = (occurrence) => {
    if (isAdmin || user.id === occurrence.user_id) {
      setSelectedOccurrence(
        selectedOccurrence && selectedOccurrence._id === occurrence._id
          ? null
          : occurrence
      );
      setEditedOccurrence(occurrence.description);
    }
  };

  // Edit an occurrence
  const handleEditOccurrence = async (occurrence) => {
    if (!isAdmin && user.id !== occurrence.user_id) {
      showToast("You do not have permission to edit this occurrence", "error");
      return;
    }
    try {
      const response = await apiClient.put(
        `/api/occurrences/${issue._id}/${occurrence._id}`,
        {
          description: editedOccurrence,
        }
      );

      const updatedOccurrences = detailedIssue.occurrences.map((occ) =>
        occ._id === occurrence._id ? response.data.occurrence : occ
      );

      setDetailedIssue({ ...detailedIssue, occurrences: updatedOccurrences });
      setSelectedOccurrence(null);
      setEditedOccurrence("");
      showToast("Occurrence updated successfully", "success");
    } catch (error) {
      console.error("Error updating occurrence:", error);
      showToast("Error updating occurrence", "error");
    }
  };

  // Delete an occurrence
  const handleDeleteOccurrence = async (occurrence) => {
    if (!isAdmin && user.id !== occurrence.user_id) {
      showToast("You do not have permission to delete this occurrence", "error");
      return;
    }
    try {
      await apiClient.delete(`/api/occurrences/${issue._id}/${occurrence._id}`);

      const updatedOccurrences = detailedIssue.occurrences.filter(
        (occ) => occ._id !== occurrence._id
      );

      setDetailedIssue({ ...detailedIssue, occurrences: updatedOccurrences });
      setSelectedOccurrence(null);
      showToast("Occurrence deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting occurrence:", error);
      showToast("Error deleting occurrence", "error");
    }
  };


  // Functions for handling comments

  // Add a new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await apiClient.post(`/api/comments/${issue._id}`, {
        comment_text: newComment,
      });

      setDetailedIssue({
        ...detailedIssue,
        comments: [...detailedIssue.comments, response.data.comment],
      });
      setNewComment("");
      showToast("Comment added successfully", "success");
    } catch (error) {
      console.error("Error adding comment:", error);
      showToast("Error adding comment", "error");
    }
  };

  // Select a comment for editing
  const handleSelectComment = (comment) => {
    if (isAdmin || user.id === comment.user_id) {
      setSelectedComment(
        selectedComment && selectedComment._id === comment._id ? null : comment
      );
      setEditedComment(comment.comment_text);
    }
  };

  // Edit a comment
  const handleEditComment = async (comment) => {
    if (!isAdmin && user.id !== comment.user_id) {
      showToast("You do not have permission to edit this comment", "error");
      return;
    }
    try {
      const response = await apiClient.put(
        `/api/comments/${issue._id}/${comment._id}`,
        {
          comment_text: editedComment,
        }
      );

      setDetailedIssue((prevState) => ({
        ...prevState,
        comments: prevState.comments.map((c) =>
          c._id === comment._id ? response.data.comment : c
        ),
      }));
      setSelectedComment(null);
      setEditedComment("");
      showToast("Comment updated successfully", "success");
    } catch (error) {
      console.error("Error updating comment:", error);
      showToast("Error updating comment", "error");
    }
  };

  // Delete a comment
  const handleDeleteComment = async (comment) => {
    if (!isAdmin && user.id !== comment.user_id) {
      showToast("You do not have permission to delete this comment", "error");
      return;
    }
    try {
      await apiClient.delete(`/api/comments/${issue._id}/${comment._id}`);

      setDetailedIssue((prevState) => ({
        ...prevState,
        comments: prevState.comments.filter((c) => c._id !== comment._id),
      }));
      setSelectedComment(null);
      showToast("Comment deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting comment:", error);
      showToast("Error deleting comment", "error");
    }
  };

  // Functions for handling attachments and image uploads

  // Handle drag over event for image upload
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Handle drag leave event for image upload
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Handle drop event for image upload
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageSelection(Array.from(e.dataTransfer.files));
    }
  };

  // Handle image selection for upload
  const handleImageSelection = (files) => {
    const newImages = [...images, ...files];
    const newPreviews = [...imagePreviews, ...files.map((file) => URL.createObjectURL(file))];
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Remove an image from the selection
  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Preview an image
  const handlePreviewImage = (imageUrl) => {
    setPreviewImage(imageUrl);
  };

  // Upload selected files
  const handleFileUpload = async () => {
    if (images.length === 0) {
      showToast('Please select files to upload', 'error');
      return;
    }

    const formData = new FormData();
    images.forEach((file) => {
      formData.append('file', file);
    });

    try {
      const response = await apiClient.post(`/api/attachments/${issue._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showToast('Files uploaded successfully', 'success');
      setImages([]);
      setImagePreviews([]);
      fetchIssueDetails(); // Refresh the issue view
    } catch (error) {
      console.error('Error uploading files:', error);
      showToast(`Error uploading files: ${error.response?.data?.details || error.message}`, 'error');
    }
  };

  // Delete an attachment
  const handleDeleteAttachment = async (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        const response = await apiClient.delete(`/api/attachments/${issue._id}/${attachmentId}`);
        if (response.status === 200) {
          showToast('Attachment deleted successfully', 'success');
          setAttachments(attachments.filter((attachment) => attachment._id !== attachmentId));
        } else {
          throw new Error(response.data.message || 'Error deleting attachment');
        }
      } catch (error) {
        console.error('Error deleting attachment:', error);
        showToast(`Error deleting attachment: ${error.message}`, 'error');
      }
    }
  };

  // Function to handle deleting the issue (if needed)
  const handleDeleteIssue = async () => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        await apiClient.delete(`/api/issues/${issue._id}`);
        showToast('Issue deleted successfully', 'success');
        onClose(); // Close the issue view
      } catch (error) {
        console.error('Error deleting issue:', error);
        showToast('Error deleting issue', 'error');
      }
    }
  };

  // Render the component
  return (
    <div className="relative mx-auto p-5 shadow-lg rounded-md bg-white max-h-[calc(100vh-40px)] overflow-y-auto">
      <div className="mt-3">
        {/* Header with edit, save, cancel buttons */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            {canEdit && !editMode && (
              <button
                onClick={handleEdit}
                className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Edit
              </button>
            )}
            {canEdit && editMode && (
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
            {isAdmin && (
              <button
                onClick={handleDeleteIssue}
                className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="mt-2 px-7 py-3">
          {/* Issue header section */}
          <div className="issue-header">
            {editMode ? (
              <div className="flex items-center space-x-2">
                {/* Editable title */}
                <input
                  type="text"
                  value={editedIssue.title}
                  onChange={(e) =>
                    setEditedIssue({ ...editedIssue, title: e.target.value })
                  }
                  className="text-xl font-bold mb-2 w-full p-2 border rounded h-[42px]"
                />
                {/* Status select */}
                <select
                  name="status_id"
                  value={currentStatus || ''}
                  onChange={handleInputChange}
                  className="p-2 border rounded h-[42px]"
                >
                  <option value={1}>Complete</option>
                  <option value={2}>In Progress</option>
                  <option value={3}>Cancelled</option>
                  <option value={4}>Pending</option>
                </select>
                {/* Charm (emoji) select */}
                <select
                  value={editedCharm || ''}
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
                {/* Display issue title, status, charm */}
                <h1 className="text-xl font-bold mb-2">{detailedIssue.title}</h1>
                <p className="text-sm text-gray-600">
                  Status: {getStatusText(currentStatus)}
                </p>
                <p className="text-2xl ml-2">{detailedIssue.charm}</p>
                <p className="text-sm text-gray-600">
                  <strong>Reference:</strong> {generateNiceReferenceId(detailedIssue)}
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
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold">Occurrences</h2>
                </div>
                <ul className="occurrences-list">
                  {(detailedIssue.occurrences || []).map((occurrence) => (
                    <li
                      key={occurrence._id}
                      className={`occurrence-item mb-2 p-3 rounded-lg shadow-sm cursor-pointer transition-all duration-200 ${
                        isAdmin || user.id === occurrence.user_id
                          ? "bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500"
                          : "bg-gray-50 hover:bg-gray-100 border-l-4 border-gray-300"
                      }`}
                      onClick={() => handleSelectOccurrence(occurrence)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Created at: </strong>
                            <span
                              title={
                                occurrence.created_at
                                  ? new Date(occurrence.created_at).toLocaleString()
                                  : ''
                              }
                            >
                              {occurrence.created_at
                                ? formatSmartDate(occurrence.created_at)
                                : 'N/A'}
                            </span>
                            <br />
                            <strong>Reported by: </strong>
                            {occurrence.user_id?.username || 'Unknown'}
                          </p>
                          <p className="mt-1">
                            <strong>Description:</strong> {occurrence.description}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Occurrence edit section */}
              {selectedOccurrence && (
                <div className="occurrence-edit mt-4">
                  {user.id === selectedOccurrence.user_id && (
                    <>
                      <textarea
                        value={editedOccurrence}
                        onChange={(e) => setEditedOccurrence(e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditOccurrence(selectedOccurrence)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                          Save Occurrence
                        </button>
                        <button
                          onClick={() => setSelectedOccurrence(null)}
                          className="px-3 py-1 bg-gray-500 text-white text-sm font-medium rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                          Cancel
                        </button>
                        {(isAdmin || user.id === selectedOccurrence.user_id) && (
                          <button
                            onClick={() => handleDeleteOccurrence(selectedOccurrence)}
                            className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                          >
                            Delete Occurrence
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  {user.id !== selectedOccurrence.user_id && (isAdmin || user.id === selectedOccurrence.user_id) && (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleDeleteOccurrence(selectedOccurrence)}
                        className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                      >
                        Delete Occurrence
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* New occurrence input */}
              <>
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
              </>

              {/* Attachments section */}
              <div className="mt-4">
                <h2 className="text-xl font-bold mb-2">Attachments</h2>
                {attachmentError && <p className="text-red-500">{attachmentError}</p>}
                {!attachmentError && attachments.length === 0 && <p>No attachments found.</p>}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {attachments.map((attachment) => (
                    <div key={attachment._id} className="relative group">
                      <img
                        src={attachment.signedUrl}
                        alt={attachment.title}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                        <div>
                          <button
                            onClick={() => handlePreviewImage(attachment.signedUrl)}
                            className="absolute top-1 right-10 bg-blue-500 text-white rounded-full w-6 h-6 flex justify-center items-center opacity-0 group-hover:opacity-100"
                            title="View attachment"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              transform="rotate(-45)"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                              />
                            </svg>
                          </button>
                          {(isAdmin || user.id === attachment.user_id) && (
                            <button
                              onClick={() => handleDeleteAttachment(attachment._id)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex justify-center items-center opacity-0 group-hover:opacity-100"
                              title="Delete attachment"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {previewImage && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="relative max-w-3xl max-h-[90vh] overflow-auto">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-full max-h-full"
                      />
                      <button
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-2 right-2 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                )}

                {/* File upload input */}
                <div className="mt-4">
                  <h2 className="text-xl font-bold mb-2">Upload Attachments</h2>
                  <div
                    className={`mb-4 p-4 h-32 border-2 ${
                      isDragging ? 'border-primary' : 'border-secondary'
                    } border-dashed rounded cursor-pointer flex justify-center items-center`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    <p className="text-sm text-gray-500">
                      {images.length > 0
                        ? `${images.length} file(s) selected`
                        : 'Drag & drop images here, or click to select'}
                    </p>
                  </div>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageSelection(Array.from(e.target.files))}
                    className="hidden"
                  />
                  {imagePreviews.length > 0 && (
                    <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index}`}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex justify-center items-center opacity-0 group-hover:opacity-100"
                            onClick={() => handleRemoveImage(index)}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {images.length > 0 && (
                    <div className="flex justify-start space-x-2">
                      <button
                        onClick={handleFileUpload}
                        className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        Upload Selected Files
                      </button>
                      <button
                        onClick={() => {
                          setImages([]);
                          setImagePreviews([]);
                        }}
                        className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Comments section */}
              <div className="mt-4">
                <h2 className="text-xl font-bold mb-2">Comments</h2>
                <ul className="comments-list">
                  {(detailedIssue.comments || []).map((comment) => (
                    <li
                      key={comment._id}
                      className={`comment-item mb-4 ${
                        isAdmin || user.id === comment.user_id
                          ? 'bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100'
                          : 'bg-gray-50 border-l-4 border-gray-300'
                      }`}
                    >
                      <div
                        className="p-3 rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:bg-opacity-80"
                        onClick={() => handleSelectComment(comment)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-600">
                              <strong>Created at: </strong>
                              <span
                                title={
                                  comment.created_at
                                    ? new Date(comment.created_at).toLocaleString()
                                    : ''
                                }
                              >
                                {comment.created_at
                                  ? formatSmartDate(comment.created_at)
                                  : 'N/A'}
                              </span>
                              <br />
                              <strong>Commented by: </strong>
                              {comment.user_id?.username || 'Unknown User'}

                            </p>
                            <p className="mt-1">
                              <strong>Comment:</strong> {comment.comment_text}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Comment edit section */}
              {selectedComment && (
                <div className="comment-edit mt-4">
                  {user.id === selectedComment.user_id && (
                    <>
                      <textarea
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditComment(selectedComment)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                          Save Comment
                        </button>
                        <button
                          onClick={() => setSelectedComment(null)}
                          className="px-3 py-1 bg-gray-500 text-white text-sm font-medium rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                          Cancel
                        </button>
                        {(isAdmin || user.id === selectedComment.user_id) && (
                          <button
                            onClick={() => handleDeleteComment(selectedComment)}
                            className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                          >
                            Delete Comment
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  {user.id !== selectedComment.user_id && (isAdmin || user.id === selectedComment.user_id) && (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleDeleteComment(selectedComment)}
                        className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                      >
                        Delete Comment
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Add new comment section */}
              <div className="mt-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Add a new comment..."
                />
                <button
                  onClick={handleAddComment}
                  className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                  Add Comment
                </button>
              </div>
            </div>
            {/* Issue sidebar with metadata */}
            <div className="issue-sidebar">
              <div className="issue-meta">
                <p>
                <strong>Reported by:</strong>{" "}
                {username.split('.').map(part => part.replace(/\d+$/, '')).join(' ')}
                </p>


                {editMode ? (
                  <>
                    <div>
                      <strong>Created at:</strong>{" "}
                      <input
                        type="datetime-local"
                        value={detailedIssue.created_at ? detailedIssue.created_at.slice(0, 16) : ''}
                        onChange={(e) => setDetailedIssue({...detailedIssue, created_at: e.target.value})}
                      />
                    </div>
                    <div>
                      <strong>Updated at:</strong>{" "}
                      <input
                        type="datetime-local"
                        value={detailedIssue.updated_at ? detailedIssue.updated_at.slice(0, 16) : ''}
                        onChange={(e) => setDetailedIssue({...detailedIssue, updated_at: e.target.value})}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Created at:</strong>{" "}
                      <span
                        title={detailedIssue.created_at ? new Date(detailedIssue.created_at).toLocaleString() : ''}
                      >
                        {detailedIssue.created_at ? formatSmartDate(detailedIssue.created_at) : 'N/A'}
                      </span>
                    </p>
                    <p>
                      <strong>Updated at:</strong>{" "}
                      <span
                        title={detailedIssue.updated_at ? new Date(detailedIssue.updated_at).toLocaleString() : ''}
                      >
                        {detailedIssue.updated_at ? formatSmartDate(detailedIssue.updated_at) : 'N/A'}
                      </span>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 max-w-sm w-full">
            <p
              className={`text-center mb-4 ${
                toast.type === "success"
                  ? "text-green-600"
                  : toast.type === "error"
                  ? "text-red-600"
                  : toast.type === "warning"
                  ? "text-yellow-600"
                  : "text-blue-600"
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
  );
}
