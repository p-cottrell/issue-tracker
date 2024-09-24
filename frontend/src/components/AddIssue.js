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
        // Create a new issue
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

  const handleDragOver = (e) => {
    e.preventDefault(); // Prevent default behavior to allow drag-and-drop
    setIsDragging(true); // Set dragging state to true
  };

  const handleDragLeave = () => {
    setIsDragging(false); // Reset dragging state
  };

  const handleDrop = (e) => {
    e.preventDefault(); // Prevent default behavior for drop
    setIsDragging(false); // Reset dragging state

    // Extract files from the drop event
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files); // Convert FileList to Array
      handleImageSelection(files); // Handle the dropped images
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files); // Convert FileList to Array
    handleImageSelection(files); // Handle the selected images
  };

  const handleImageSelection = (files) => {
    const newImages = [...images, ...files]; // Merge new images with existing ones
    const newPreviews = [...imagePreviews, ...files.map((file) => URL.createObjectURL(file))]; // Create preview URLs

    setImages(newImages); // Update state with selected images
    setImagePreviews(newPreviews); // Update state with image previews
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index); // Remove image from array
    const newPreviews = imagePreviews.filter((_, i) => i !== index); // Remove preview from array
    setImages(newImages); // Update images state
    setImagePreviews(newPreviews); // Update previews state
  };

  const handlePreviewImage = (imageUrl) => {
    setPreviewImage(imageUrl); // Set the image to be displayed in the modal
  };

  return (
    <div className="bg-white p-8 rounded shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl text-dark font-semibold mb-6 text-center">Add New Issue</h2>
      <form onSubmit={addHandler}>
        <label className="block text-dark mb-2">Title:</label>
        <div className="mb-6 flex items-center space-x-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-gray-300 border border-secondary p-2 rounded-full text-center flex justify-center items-center w-12 h-12"
            >
              {charm}
            </button>
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

        <div className="mb-6">
          <label className="block text-dark mb-2">Description:</label>
          <textarea
            className="bg-white border border-secondary p-2 rounded outline-none w-full resize-y h-52"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe everything about the issue here..."
          />
        </div>

        <label className="block text-dark mb-2">Attachments:</label>
        <div
          className={`mb-6 p-4 h-32 border-2 ${isDragging ? 'border-primary' : 'border-secondary'} border-dashed rounded cursor-pointer flex justify-center items-center`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()} // Open file input when clicked
        >
          <p className="text-sm text-gray-500">
            {images.length > 0 ? `${images.length} file(s) selected` : 'Drag & drop images here, or click to select'}
          </p>
        </div>

        <input
          id="fileInput" // Assign an id to the input for manual trigger
          type="file"
          accept="image/*"
          multiple // Allow multiple image uploads
          onChange={handleFileChange} // Handle file input change
          className="hidden" // Hidden input
        />

        {imagePreviews.length > 0 && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index}`}
                  className="w-full h-40 object-cover rounded"
                />
                <button
                  type="button"
                  className="absolute top-1 right-10 bg-blue-500 text-white rounded-full w-6 h-6 flex justify-center items-center opacity-0 group-hover:opacity-100"
                  onClick={() => handlePreviewImage(preview)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" transform="rotate(-45)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
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
  );
};

export default AddIssue;