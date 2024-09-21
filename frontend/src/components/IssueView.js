import React, { useState, useEffect, useCallback } from "react";
import "./IssueView.css";
import apiClient from "../api/apiClient";
import { useUser } from "../context/UserContext";

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

const emojiOptions = ["🐞", "🚀", "⚠️"];

export default function IssueView({ issue, onClose }) {
  const { user } = useUser();

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
  const [newOccurrence, setNewOccurrence] = useState("");

  // New state for occurrence editing
  const [selectedOccurrence, setSelectedOccurrence] = useState(null);

  const [editedOccurrence, setEditedOccurrence] = useState("");


  const [editedCharm, setEditedCharm] = useState(issue.charm);

  const [toast, setToast] = useState(null);

  const [canEdit, setCanEdit] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [userName, setUserName] = useState("");
 
  const [attachments, setAttachments] = useState([]);
  const [attachmentError, setAttachmentError] = useState(null);

  const [images, setImages] = useState([]); // Stores the selected image files
  const [imagePreviews, setImagePreviews] = useState([]); // Stores URLs for image previews
  const [isDragging, setIsDragging] = useState(false); // Drag-and-drop state for the images


  

  const fetchIssueDetails = useCallback(async () => {
    try {
      const response = await apiClient.get(`/api/issues/${issue._id}`);
      setDetailedIssue(response.data);
      fetchAttachments();
    } catch (error) {
      console.error('Error fetching issue details:', error);
      showToast('Error fetching issue details', 'error');
    }
  }, [issue._id]);

  useEffect(() => {
    fetchIssueDetails();
    
    const userCanEdit = user.role === 'admin' || user.id === issue.reporter_id;
    setCanEdit(userCanEdit);
    setUserName(user.username);
    setIsAdmin(user.role === 'admin');
  }, [issue._id, user, fetchIssueDetails, issue.reporter_id]);

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

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageSelection(Array.from(e.dataTransfer.files));
    }
  };

  const handleImageSelection = (files) => {
    const newImages = [...images, ...files];
    const newPreviews = [...imagePreviews, ...files.map(file => URL.createObjectURL(file))];
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

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

  const handleDeleteAttachment = async (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        const response = await apiClient.delete(`/api/attachments/${issue._id}/${attachmentId}`);
        if (response.status === 200) {
          showToast('Attachment deleted successfully', 'success');
          setAttachments(attachments.filter(attachment => attachment._id !== attachmentId));
        } else {
          throw new Error(response.data.message || 'Error deleting attachment');
        }
      } catch (error) {
        console.error('Error deleting attachment:', error);
        showToast(`Error deleting attachment: ${error.message}`, 'error');
      }
    }
  };

  const handleEdit = () => {
    if (canEdit) {
      setEditMode(true);
      setEditedIssue({ ...detailedIssue });
    }
  };

  const showToast = (message, type, duration, onConfirm = null) => {
    setToast({ message, type, onConfirm, duration });
    if (!onConfirm) {
      setTimeout(() => setToast(null), duration);
    }
  };



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
  

  const handleSave = async () => {
    if (canEdit) {
      try {
        const dataToSend = {
          ...editedIssue,
          created_at: detailedIssue.created_at,
          updated_at: new Date().toISOString(),
          occurrences: editedIssue.occurrences.map(occurrence => ({
            ...occurrence,
            user_id: occurrence.user_id || user.id // Use the existing user_id or fallback to the current user's id
          }))
        };

        console.log("Sending data to update issue:", dataToSend);
        const response = await apiClient.put(`/api/issues/${issue._id}`, dataToSend);

        setDetailedIssue(response.data.updatedIssue);
        setEditMode(false);
        showToast("Issue updated successfully", "success", 5000);

        onClose(response.data.updatedIssue);
      } catch (error) {
        console.error("Error updating issue:", error);
        showToast("Error updating issue", "error");
      }
    }
  };

  const handleCancel = () => {
    if (canEdit) {
      setEditMode(false);
      setEditedIssue(detailedIssue);
    }
  };

  const handleAddOccurrence = async () => {
    if (!newOccurrence.trim()) return;

    try {
      console.log("Sending occurrence:", { description: newOccurrence });
      const response = await apiClient.post(`/api/occurrences/${issue._id}`, {
        description: newOccurrence,
        user_id: user.id, // Include the user's ID
      });

      console.log("Response:", response.data);

      setDetailedIssue({
        ...detailedIssue,
        occurrences: [...detailedIssue.occurrences, response.data.occurrence],
      });
      setNewOccurrence("");
      showToast("Occurrence added successfully", "success");
    } catch (error) {
      console.error(
        "Error adding occurrence:",
        error.response ? error.response.data : error.message
      );
      showToast(
        `Failed to add occurrence: ${
          error.response ? error.response.data.message : error.message
        }`,
        "error"
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedIssue({ ...editedIssue, [name]: value });
  };

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

  const handleDeleteOccurrence = async (occurrence) => {
    if (user.id !== occurrence.user_id) {
      showToast(
        "You do not have permission to delete this occurrence",
        "error"
      );
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

  const getStatusText = (statusId) => {
    switch (statusId) {
      case 0:
        return "Pending";
      case 1:
        return "Complete";
      case 2:
        return "In Progress";
      case 3:
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

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
          edited_by: user.id,
        }
      );

      setDetailedIssue(prevState => ({
        ...prevState,
        comments: prevState.comments.map(c => 
          c._id === comment._id ? response.data.comment : c
        )
      }));
      setSelectedComment(null);
      setEditedComment("");
      showToast("Comment updated successfully", "success");
    } catch (error) {
      console.error("Error updating comment:", error);
      showToast("Error updating comment", "error");
    }
  };

  const handleDeleteComment = async (comment) => {
    if (user.id !== comment.user_id) {
      showToast("You do not have permission to delete this comment", "error");
      return;
    }
    try {
      await apiClient.delete(`/api/comments/${issue._id}/${comment._id}`);

      setDetailedIssue(prevState => ({
        ...prevState,
        comments: prevState.comments.filter(c => c._id !== comment._id)
      }));
      setSelectedComment(null);
      showToast("Comment deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting comment:", error);
      showToast("Error deleting comment", "error");
    }
  };

  const handleSelectComment = (comment) => {
    if (isAdmin || user.id === comment.user_id) {
      setSelectedComment(
        selectedComment && selectedComment._id === comment._id ? null : comment
      );
      setEditedComment(comment.comment_text);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
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
                  //onClick={handleDelete}
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
                              <strong>Date:</strong>{" "}
                              {new Date(occurrence.created_at).toLocaleString()}
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
                {selectedOccurrence && (isAdmin || user.id === selectedOccurrence.user_id) && (
                  <div className="occurrence-edit mt-4">
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
                      {user.id === selectedOccurrence.user_id && (
                        <button
                          onClick={() => handleDeleteOccurrence(selectedOccurrence)}
                          className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                        >
                          Delete Occurrence
                        </button>
                      )}
                    </div>
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
                          <p className="text-white text-sm mb-2">{attachment.title}</p>
                          <div>
                            <a 
                              href={attachment.signedUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded mr-2"
                            >
                              View
                            </a>
                            {(isAdmin || user.id === attachment.user_id) && (
                              <button
                                onClick={() => handleDeleteAttachment(attachment._id)}
                                className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* File upload input */}
                  <div className="mt-4">
                    <h2 className="text-xl font-bold mb-2">Upload Attachments</h2>
                    <div
                      className={`mb-4 p-4 h-32 border-2 ${isDragging ? 'border-primary' : 'border-secondary'} border-dashed rounded cursor-pointer flex justify-center items-center`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('fileInput').click()}
                    >
                      <p className="text-sm text-gray-500">
                        {images.length > 0 ? `${images.length} file(s) selected` : 'Drag & drop images here, or click to select'}
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
                    <button
                      onClick={handleFileUpload}
                      className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      Upload Selected Files
                    </button>
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
                              <strong>Date:</strong> {new Date(comment.created_at).toLocaleString()}
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
                {selectedComment && (isAdmin || user.id === selectedComment.user_id) && (
                  <div className="comment-edit mt-4">
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
                      {user.id === selectedComment.user_id && (
                        <button
                          onClick={() => handleDeleteComment(selectedComment)}
                          className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                        >
                          Delete Comment
                        </button>
                      )}
                    </div>
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
                    {userName.split('.').map(part => part.replace(/\d+$/, '')).join(' ')}
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
    </div>
  );
}
