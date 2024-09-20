import React, { useState } from 'react';
import apiClient from '../api/apiClient';

/**
 * AddIssuePopup Component
 * 
 * This component provides a form to add a new issue, along with the ability to 
 * upload multiple image attachments. It supports drag-and-drop functionality for
 * image uploads, and previews the selected images with an option to remove them.
 * 
 * @param {function} closeHandler - Function to close the popup.
 */
const AddIssue = ({ closeHandler }) => {
  // State variables for managing issue details
  const [title, setTitle] = useState(''); // Title of the issue
  const [description, setDescription] = useState(''); // Description of the issue
  const [charm, setCharm] = useState('⚠️'); // Selected charm icon (default is ⚠️)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Controls visibility of the charm dropdown
  const [images, setImages] = useState([]); // Stores the selected image files
  const [imagePreviews, setImagePreviews] = useState([]); // Stores URLs for image previews
  const [isDragging, setIsDragging] = useState(false); // Drag-and-drop state for the images

  // List of available charms for selection
  const charms = [
    '⚠️', '🚀', '🐞', '💻', '📅', '🌐', '🏆', '🏠', '🐈', '🐕', '⏱️', '🎵',
    '⭐', '🔎', '📸', '💾', '❤️', '🎬', '📖', '🎂', '🖥️', '🔥', '🎫', '🔧',
    '🚫', '💥', '🎓', '📚'
  ];

  /**
   * Handle form submission to add a new issue.
   * 
   * This function first creates the issue by sending the title, description, 
   * and selected charm to the backend. If images are attached, they are uploaded
   * after the issue is successfully created.
   * 
   * @param {Event} e - Form submit event.
   */
  const addHandler = (e) => {
    e.preventDefault(); // Prevent default form submission
    closeHandler(); // Close the popup after submission

    const createIssue = async () => {
      const issueData = {
        title,
        description,
        charm,
      };

      try {
        // Step 1: Create the issue
        const response = await apiClient.post('/api/issues', issueData, {
          headers: {
            'Content-Type': 'application/json', // Send JSON data for issue creation
          },
        });

        const { issueID } = response.data; // Get the created issue ID

        // Step 2: If images are selected, upload them
        if (images.length > 0) {
          await uploadAttachments(issueID); 
        } else {
          window.location.reload(); // Reload the page if no attachments
        }

      } catch (error) {
        console.error('Error creating issue:', error);
      }
    };

    /**
     * Upload the selected images as attachments to the created issue.
     * 
     * This function takes the newly created issue's ID and uploads each selected image file.
     * 
     * @param {string} issueId - The ID of the created issue.
     */
    const uploadAttachments = async (issueId) => {
      const formData = new FormData();
      
      images.forEach((image) => {
        formData.append('file', image); // Append each image file
        formData.append('title', image.name.split('.').slice(0, -1).join('.')); // Use the file name as the title
      });

      try {
        // Upload images as attachments
        const response = await apiClient.post(`/api/attachments/${issueId}`, formData, {
          withCredentials: true, // Ensure cookies are sent for authentication
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Attachments uploaded:', response.data);
        window.location.reload(); // Reload the page after successful upload
      } catch (error) {
        console.error('Error uploading attachments:', error);
      }
    };

    createIssue(); // Create the issue and handle the attachments if necessary
  };

  /**
   * Handle drag-over event to indicate an image drop zone.
   * 
   * @param {Event} e - Drag event.
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true); // Activate dragging state
  };

  /**
   * Handle drag-leave event to reset the dragging state.
   */
  const handleDragLeave = () => {
    setIsDragging(false); // Deactivate dragging state
  };

  /**
   * Handle the drop event to get the selected images and preview them.
   * 
   * @param {Event} e - Drop event containing the dragged files.
   */
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false); // Reset dragging state

    // Extract the files from the drop event and process them
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      handleImageSelection(files); // Handle multiple files dropped
    }
  };

  /**
   * Handle the selection of files from the file input.
   * 
   * @param {Event} e - File input change event containing selected files.
   */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    handleImageSelection(files); // Handle multiple files selected
  };

  /**
   * Process the selected images and generate their preview URLs.
   * 
   * @param {Array} files - List of selected image files.
   */
  const handleImageSelection = (files) => {
    const newImages = [...images, ...files]; // Add new images to the existing list
    const newPreviews = [...imagePreviews, ...files.map((file) => URL.createObjectURL(file))];

    setImages(newImages); // Update state with new images
    setImagePreviews(newPreviews); // Update state with image previews
  };

  /**
   * Remove an image from the list of selected images.
   * 
   * @param {number} index - Index of the image to be removed.
   */
  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index); // Remove the selected image
    const newPreviews = imagePreviews.filter((_, i) => i !== index); // Remove the corresponding preview
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-11/12 max-w-xl sm:w-9/12 md:w-9/12">
        <h2 className="text-lg text-dark font-semibold mb-4 text-center">Add New Issue</h2>
        <form onSubmit={addHandler}>
          {/* Title and Charm Container */}
          <label className="block text-dark mb-2">Title:</label>
          <div className="mb-4 flex items-center space-x-2">
            {/* Charm Selection */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-gray-300 border border-secondary p-2 rounded-full text-center flex justify-center items-center w-12 h-12"
              >
                {charm}
              </button>

              {/* Charm Dropdown */}
              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 p-2 bg-white border border-gray-200 shadow-lg rounded grid grid-cols-4 gap-2 overflow-visible z-10 w-80">
                  {charms.map((charmOption, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer p-1 rounded-lg text-xl flex justify-center items-center 
                      ${charm === charmOption ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                      onClick={() => {
                        setCharm(charmOption);
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
              <label className="sr-only">Title: <font color="red">*</font></label>
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

          {/* Drag and Drop Image Section */}
          <label className="block text-dark mb-2">Attachments:</label>
          <div
            className={`mb-4 p-4 h-32 border-2 ${isDragging ? 'border-primary' : 'border-secondary'} border-dashed rounded cursor-pointer flex justify-center items-center`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()} // Trigger click on the hidden file input
          >
            <p className="text-sm text-gray-500">
              {images.length > 0 ? `${images.length} file(s) selected` : 'Drag & drop images here, or click to select'}
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            id="fileInput" // Assign an id to the input
            type="file"
            accept="image/*"
            multiple // Allow multiple files
            onChange={handleFileChange}
            className="hidden" // Use hidden class to hide the input
          />

          {/* Display Image Previews with Remove Button */}
          {imagePreviews.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    className="w-full h-32 object-cover rounded"
                  />
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

          {/* Buttons */}
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
      </div>
    </div>
  );
};

export default AddIssue;
