import React, { useState } from 'react';
import apiClient from '../api/apiClient';

const AddIssuePopup = ({ closeHandler }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [charm, setCharm] = useState('⚠️'); // Default charm
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to control the dropdown visibility
  const [image, setImage] = useState(null); // State to handle image file
  const [isDragging, setIsDragging] = useState(false); // State for drag-and-drop

  // Array of all available charms
  const charms = [
    '⚠️', '🚀', '🐞', '✈️', '📅', '🚑', '🏆', '🏠', '💊', '👥', '⏱️', '🎵',
    '⭐', '👤', '🎈', '🍽️', '❤️', '🎬', '📖', '🎂', '🖥️', '🚚', '🎫', '🔧',
    '🏍️', '🚍', '🎓', '📚'
  ];

  function addHandler() {
    closeHandler(); // Close the add issue popup.

    const addIssue = async () => {
      const formData = new FormData(); // Using FormData to handle file upload
      formData.append('title', title);
      formData.append('description', description);
      formData.append('charm', charm);
      if (image) {
        formData.append('image', image); // Append image file if exists
      }

      try {
        const response = await apiClient.post('api/issues', formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Set header for multipart form data
          },
        });

        console.log('Issue added:', response.data);
        window.location.reload();
      } catch (error) {
        console.log('There was an error adding the issue:', error);
      }
    };
    addIssue();
  }

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true); // Set dragging state
  };

  const handleDragLeave = () => {
    setIsDragging(false); // Reset dragging state
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false); // Reset dragging state

    // Extract the file from the drop event
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setImage(e.dataTransfer.files[0]); // Set the first file as the selected image
    }
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

              {/* Compact Dropdown menu */}
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
              {image ? `Selected: ${image.name}` : 'Drag & drop an image here, or click to select one'}
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            id="fileInput" // Assign an id to the input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="hidden" // Use hidden class to hide the input
/>

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

export default AddIssuePopup;
