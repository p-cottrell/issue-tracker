import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import '../styles/loader.css';

export default function Issue({ data, openIssueModal, deleteHandler }) {
    const navigate = useNavigate(); // Hook for programmatic navigation
    const { openModal, closeModal } = useModal(); // Custom hook to open or close modal dialogs
    const [isLoading, setIsLoading] = useState(true); // State to track the loading state of the image

    // Extract the latest status from the status_history array. 
    // This ensures we always show the most recent status.
    const latestStatus = data.status_history && data.status_history.length > 0 
        ? data.status_history[data.status_history.length - 1].status_id 
        : undefined;

    // Function to determine the appropriate CSS class based on the latest status.
    // This function returns different classes for different status IDs.
    const getStatusClass = () => {
        const baseClass = 'whitespace-nowrap px-3 py-1 rounded-full text-sm font-semibold'; // Add `whitespace-nowrap` to prevent wrapping
        switch (latestStatus) {
            case 1:
                return `${baseClass} bg-green-500 text-white`; // Complete
            case 2:
                return `${baseClass} bg-yellow-500 text-white`; // In Progress
            case 3:
                return `${baseClass} bg-red-500 text-white`; // Cancelled
            default:
                return `${baseClass} bg-gray-500 text-white`; // Pending
        }
    };

    // Function to get the status text corresponding to the latest status.
    // This converts status IDs to human-readable text.
    const getStatusText = () => {
        switch (latestStatus) {
            case 1:
                return 'Complete';
            case 2:
                return 'In Progress';
            case 3:
                return 'Cancelled';
            default:
                return 'Pending';
        }
    };

    // Function to check if a character is a letter (used for charm styling).
    // Utilizes Unicode support to handle various languages and symbols.
    const isLetter = (char) => {
        return /\p{L}/u.test(char); 
    };

    // Function to handle the click event on an image.
    // Opens a modal displaying the full preview of the image.
    const handleImageClick = (imageSrc) => {
        openModal(
            <div className="relative">
                <img src={imageSrc} alt="Full Preview" className="rounded-lg max-w-full max-h-full" />
            </div>
        );
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between transition-transform transform hover:scale-105 hover:shadow-lg relative">
            {/* Header Line */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    {/* Charm Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 ${isLetter(data.charm) ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'} rounded-full flex justify-center items-center text-lg`}>
                        {data.charm}
                    </div>
                    {/* Issue Title */}
                    <h3 className="ml-2 text-lg font-semibold text-gray-800 line-clamp-2 overflow-hidden text-ellipsis">
                        {data.title}
                    </h3>
                </div>
                {/* Status Indicator */}
                <div className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusClass()}`}>
                    {getStatusText()}
                </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-4 line-clamp-5 text-clip">{data.description}</p>

            {/* Reference */}
            <p className="text-sm text-gray-500 mb-4">
                <strong>Reference:</strong> {data._id}
            </p>

            {/* Attachments */}
            <div className="mb-4 relative">
                <strong className="text-sm text-gray-500 mb-4">Attachment(s):</strong>
                <div className="bg-gray-200 rounded-md h-40 flex items-center justify-center relative">
                    {isLoading && (
                        // Loading spinner to indicate the image is still loading
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="loader"></div>
                        </div>
                    )}
                    {/* Image */}
                    <img
                        src={`https://loremflickr.com/250/150/kitten?lock=${data._id}`}
                        alt="Attachment"
                        className="rounded-md object-cover cursor-pointer"
                        onLoad={() => setIsLoading(false)} // Set loading state to false once the image is loaded
                        onClick={() => handleImageClick(`https://loremflickr.com/250/150/kitten?lock=${data._id}`)} // Handle image click to show full preview
                    />
                </div>
            </div>

            {/* View More Button */}
            <button
                onClick={() => openIssueModal(data)} // Open the detailed view modal for the issue
                className="mt-auto bg-primary text-white py-2 px-4 my-2 rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
                View More
            </button>
        </div>
    );
}
