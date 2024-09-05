import React, { useState } from 'react';
import apiClient from '../api/apiClient';

const DeleteIssuePopup = ({ closeHandler, issue}) => {

    function deleteHandler(issue) {
        closeHandler(); // Close the delete issue popup.
        const id = issue._id;
  
        const deleteIssue = async () => {
            try {
                const response = await apiClient.delete(`api/issues/${id}`)
                console.log('Issue deleted:', response);
                window.location.reload();
            } catch (error) {
                console.log('There was an error deleting the issue:', error);
            }
          };
          deleteIssue();
      }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded shadow-lg w-11/12 max-w-xl sm:w-9/12 md:w-9/12"> {/* Adjust width for smaller screens */}
            <h2 className="text-lg text-dark font-semibold mb-4 text-center">"{issue.title}"</h2>
            <h2 className="text-lg text-dark font-semibold mb-4 text-center">Are you sure you want to delete this issue?</h2>
            <button onClick={() => deleteHandler(issue)}>Delete</button>
            <button onClick={closeHandler}>Close</button>
        </div>
        </div>
    );
};

export default DeleteIssuePopup;