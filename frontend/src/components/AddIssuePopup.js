import React, { useState } from 'react';
import apiClient from '../api/apiClient';

const AddIssuePopup = ({ closeHandler }) => {
  // State variables for the form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [charm, setCharm] = useState('');

  function addHandler() {
    closeHandler(); // Close the add issue popup.

    const addIssue = async () => {
      try {
        const response = await apiClient.post('api/issues', {
          title,
          description,
          charm,
        });

        console.log('Issue added:', response.data);
        window.location.reload();
      } catch (error) {
        console.log('There was an error adding the issue:', error);
      }
    };
    addIssue();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-11/12 max-w-xl sm:w-9/12 md:w-9/12"> {/* Adjust width for smaller screens */}
        <h2 className="text-lg text-dark font-semibold mb-4 text-center">Add New Issue</h2>
        <p><font color="red">*</font> denotes a required field.</p>
        <form onSubmit={addHandler}>
          {/* Title Input */}
          <div className="mb-4">
            <label className="block text-dark mb-2">Title: <font color="red">*</font></label>
            <input
              className="bg-neutral border border-secondary p-2 outline-none w-full"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What is the issue?"
              required
            />
          </div>

          {/* Description Input */}
          <div className="mb-4">
            <label className="block text-dark mb-2">Description:</label>
            <input
              className="bg-neutral border border-secondary p-2 outline-none w-full"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe everything about the issue here..."
            />
          </div>

          {/* Charm Selection */}
          <div className="mb-4">
            <label className="block text-dark mb-2">Charm: <font color="red">*</font></label>
            <select
              className="bg-neutral border border-secondary p-2 outline-none w-full"
              value={charm}
              onChange={(e) => setCharm(e.target.value)}
              required
            >
              <option value="" disabled selected>
                Select a charm
              </option>
              <option value="🚀">🚀</option>
              <option value="⚠️">⚠️</option>
              <option value="🐞">🐞</option>
            </select>
          </div>

          {/* Add attachment */}
          <div className="mb-4">
          <label className="block text-dark mb-2">Add attachment:</label>
            <input
              type="file"
              id="myFile"
              name="filename"
              accept="image/*" // MAKE SURE SERVER-SIDE VALIDATION IS ALSO IMPLEMENTED.
              onChange={(e) => setAttachment(e.target.value)}
            />
          </div>
          
          

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