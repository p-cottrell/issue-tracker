import React, { useState } from 'react';

const AddIssuePopup = ({ closeHandler, clickHandler }) => {
  // State variables for the form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [charm, setCharm] = useState(null);

  // Handler for form submission
  const addHandler = (event) => {
    event.preventDefault(); // Prevent form submission
    clickHandler({ title, description, charm });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-11/12 max-w-xl sm:w-9/12 md:w-9/12"> {/* Adjust width for smaller screens */}
        <h2 className="text-lg text-dark font-semibold mb-4 text-center">Add New Issue</h2>
        <form onSubmit={addHandler}>
          {/* Title Input */}
          <div className="mb-4">
            <label className="block text-dark mb-2">Title:</label>
            <input
              className="bg-neutral border border-secondary p-2 outline-none w-full"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What is the issue?"
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
            <label className="block text-dark mb-2">Charm:</label>
            <select
              className="bg-neutral border border-secondary p-2 outline-none w-full"
              value={charm}
              onChange={(e) => setCharm(e.target.value)}
            >
              <option value="" disabled>
                Select a charm
              </option>
              <option value="🚀">🚀</option>
              <option value="⚠️">⚠️</option>
              <option value="🐞">🐞</option>
            </select>
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