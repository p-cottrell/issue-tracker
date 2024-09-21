import React, { useState } from 'react';
import apiClient from '../api/apiClient';

const AddIssue = ({ closeHandler }) => {
  // State for form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [charm, setCharm] = useState('⚠️'); // Default charm
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown state for selecting charms

  // State for handling image uploads
  const [images, setImages] = useState([]); // Array of selected image files
  const [imagePreviews, setImagePreviews] = useState([]); // Array of image preview URLs
  const [isDragging, setIsDragging] = useState(false); // Drag-and-drop state

  // State for displaying a preview modal
  const [previewImage, setPreviewImage] = useState(null); // Selected image to preview in modal

  // List of available charms for selection
  const charms = [
    '⚠️', '🚀', '🐞', '💻', '📅', '🌐', '🏆', '🏠', '🐈', '🐕', '⏱️', '🎵',
    '⭐', '🔎', '📸', '💾', '❤️', '🎬', '📖', '🎂', '🖥️', '🔥', '🎫', '🔧',
    '🚫', '💥', '🎓', '📚'
  ];

  /**
   * Handles form submission and creates a new issue.
   * If images are selected, they are uploaded after the issue is created.
   */
  const addHandler = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    closeHandler(); // Close the popup after submission

    const createIssue = async () => {
      const issueData = {
        title,
        description,
        charm,
      };

      try {
        //Create a new issue
        const response = await apiClient.post('/api/issues', issueData, {
          headers: {
            'Content-Type': 'application/json', // JSON content type for issue creation
          },
        });

        const { issueID } = response.data; // Retrieve the created issue's ID

        // If images are selected, upload them as attachments
        if (images.length > 0) {
          await uploadAttachments(issueID);
        } else {
          window.location.reload(); // Reload the page if no attachments were uploaded
        }

      } catch (error) {
        console.error('Error creating issue:', error);
      }
    };

    /**
     * Uploads the selected images as attachments to the created issue.
     * 
     * @param {string} issueId - The ID of the created issue.
     */
    const uploadAttachments = async (issueId) => {
      const formData = new FormData(); // Use FormData for file uploads
      images.forEach((image) => {
        formData.append('file', image); // Append each image file to FormData
        formData.append('title', image.name.split('.').slice(0, -1).join('.')); // Use the image's name as the title
      });

      try {
        // Upload attachments to the server
        await apiClient.post(`/api/attachments/${issueId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Required content type for file uploads
          },
        });

        console.log('Attachments uploaded successfully.');
        window.location.reload(); // Reload the page after successful upload
      } catch (error) {
        console.error('Error uploading attachments:', error);
      }
    };

    createIssue(); // Create the issue and handle attachments
  };

  /**
   * Handles drag-over event to enable drag-and-drop functionality for images.
   */
  const handleDragOver = (e) => {
    e.preventDefault(); // Prevent default behavior to allow drag-and-drop
    setIsDragging(true); // Set dragging state to true
  };

  /**
   * Resets dragging state when the dragged item leaves the drop area.
   */
  const handleDragLeave = () => {
    setIsDragging(false); // Reset dragging state
  };

  /**
   * Handles the drop event when files are dragged and dropped into the upload area.
   * 
   * @param {Object} e - Drop event.
   */
  const handleDrop = (e) => {
    e.preventDefault(); // Prevent default behavior for drop
    setIsDragging(false); // Reset dragging state

    // Extract files from the drop event
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files); // Convert FileList to Array
      handleImageSelection(files); // Handle the dropped images
    }
  };

  /**
   * Handles image selection via the file input.
   * 
   * @param {Object} e - Change event for file input.
   */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files); // Convert FileList to Array
    handleImageSelection(files); // Handle the selected images
  };

  /**
   * Adds the selected images to the list of image files and generates preview URLs.
   * 
   * @param {Array} files - Array of selected image files.
   */
  const handleImageSelection = (files) => {
    const newImages = [...images, ...files]; // Merge new images with existing ones
    const newPreviews = [...imagePreviews, ...files.map((file) => URL.createObjectURL(file))]; // Create preview URLs

    setImages(newImages); // Update state with selected images
    setImagePreviews(newPreviews); // Update state with image previews
  };

  /**
   * Removes a selected image from the list and its corresponding preview.
   * 
   * @param {number} index - The index of the image to be removed.
   */
  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index); // Remove image from array
    const newPreviews = imagePreviews.filter((_, i) => i !== index); // Remove preview from array
    setImages(newImages); // Update images state
    setImagePreviews(newPreviews); // Update previews state
  };

  /**
   * Displays a preview of the selected image in a modal popup.
   * 
   * @param {string} imageUrl - The URL of the image to preview.
   */
  const handlePreviewImage = (imageUrl) => {
    setPreviewImage(imageUrl); // Set the image to be displayed in the modal
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-11/12 max-w-xl sm:w-9/12 md:w-9/12">
        <h2 className="text-lg text-dark font-semibold mb-4 text-center">Add New Issue</h2>
        <form onSubmit={addHandler}>
          {/* Title and Charm Input */}
          <label className="block text-dark mb-2">Title:</label>
          <div className="mb-4 flex items-center space-x-2">
            {/* Charm Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-gray-300 border border-secondary p-2 rounded-full text-center flex justify-center items-center w-12 h-12"
              >
                {charm}
              </button>

              {/* Dropdown Menu for Charm Selection */}
              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 p-2 bg-white border border-gray-200 shadow-lg rounded grid grid-cols-4 gap-2 overflow-visible z-10 w-80">
                  {charms.map((charmOption, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer p-1 rounded-lg text-xl flex justify-center items-center 
                      ${charm === charmOption ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                      onClick={() => {
                        setCharm(charmOption); // Set selected charm
                        setIsDropdownOpen(false); // Close the dropdown after selection
                      }}
                    >
                      {charmOption}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title Input */}
            <div className="flex-grow">
              <input
                className="bg-white border border-secondary p-2 rounded outline-none w-full"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What is the issue?"
                required
              />
            </div>
          </div>

          {/* Description Input */}
          <div className="mb-4">
            <label className="block text-dark mb-2">Description:</label>
            <textarea
              className="bg-white border border-secondary p-2 rounded outline-none w-full resize-y h-52"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe everything about the issue here..."
            />
          </div>

          {/* Drag-and-Drop Image Section */}
          <label className="block text-dark mb-2">Attachments:</label>
          <div
            className={`mb-4 p-4 h-32 border-2 ${isDragging ? 'border-primary' : 'border-secondary'} border-dashed rounded cursor-pointer flex justify-center items-center`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()} // Open file input when clicked
          >
            <p className="text-sm text-gray-500">
              {images.length > 0 ? `${images.length} file(s) selected` : 'Drag & drop images here, or click to select'}
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            id="fileInput" // Assign an id to the input for manual trigger
            type="file"
            accept="image/*"
            multiple // Allow multiple image uploads
            onChange={handleFileChange} // Handle file input change
            className="hidden" // Hidden input
          />

          {/* Remove and View Buttons for Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    className="w-full h-40 object-cover rounded"
                  />
                  {/* Button to view the image in a popup */}
                  <button
                    type="button"
                    className="absolute top-1 right-10 bg-blue-500 text-white rounded-full w-6 h-6 flex justify-center items-center opacity-0 group-hover:opacity-100"
                    onClick={() => handlePreviewImage(preview)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" transform="rotate(-45)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                  {/* X button to remove the image */}
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

          {/* Form Buttons */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="mr-4 px-6 py-2 bg-primary text-white rounded hover:bg-primaryHover"
            >
              + Add
            </button>
            <button
              type="button"
              className="px-6 py-2 bg-gray-300 text-dark rounded hover:bg-gray-400"
              onClick={closeHandler}
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Image Preview Modal */}
        {previewImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative max-w-3xl max-h-[90vh] overflow-auto">
              <img src={previewImage} alt="Preview" className="max-w-full max-h-full" />
              <button 
                onClick={() => setPreviewImage(null)}
                className="absolute top-2 right-2 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddIssue;





