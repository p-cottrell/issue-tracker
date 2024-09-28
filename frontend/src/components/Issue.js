import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { useModal } from '../context/ModalContext';
import { generateNiceReferenceId } from '../helpers/IssueHelpers';
import '../styles/loader.css';

export default function Issue({ data, openIssueModal, deleteHandler }) {
    const { openModal, closeModal } = useModal();
    const [isLoading, setIsLoading] = useState(true);
    const [isImageError, setIsImageError] = useState(false);
    const [attachments, setAttachments] = useState(data.attachments || []);

    // Effect 1: Fetch attachments if signedUrl is missing
    useEffect(() => {
        if (attachments && attachments.length > 0 && !attachments[0].signedUrl) {
            fetchAttachments();
        }
    }, [attachments]);

    // Fetch attachments function (only if signedUrl is missing)
    const fetchAttachments = async () => {
        try {
            const response = await apiClient.get(`/api/attachments/${data._id}`);
            const updatedAttachments = response.data.map(attachment => ({ ...attachment, signedUrl: attachment.signedUrl || '' }));
            setAttachments(updatedAttachments);
        } catch (error) {
            console.error('Error fetching attachments:', error);
        }
    };

    // Effect 2: Load the image and handle errors
    useEffect(() => {
        if (attachments && attachments.length > 0 && attachments[0].signedUrl) {
            const img = new Image();
            img.src = attachments[0].signedUrl;

            img.onload = () => setIsLoading(false);
            img.onerror = (ev) => {
                setIsImageError(true);
                setIsLoading(false);
                console.error(`Failed to load image '${attachments[0].signedUrl}':`, ev);
            };
        }
    }, [attachments]); // Ensure this effect re-runs when `attachments` are updated

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
            case 4:
                return `${baseClass} bg-gray-500 text-white`; // Pending
            default:
                return `${baseClass} bg-gray-500 text-white`; // Unknown
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
            case 4:
                return 'Pending';
            default:
                return 'Unknown';
        }
    };

    // Function to check if a character is a letter (used for charm styling).
    // Utilises Unicode support to handle various languages and symbols.
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
    const [mouseDownPosition, setMouseDownPosition] = useState(null);

    const handleMouseDown = (e) => {
        setMouseDownPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e) => {
        const mouseUpPosition = { x: e.clientX, y: e.clientY };
        const distance = Math.sqrt(
            Math.pow(mouseUpPosition.x - mouseDownPosition.x, 2) +
            Math.pow(mouseUpPosition.y - mouseDownPosition.y, 2)
        );

        // If the distance is less than a threshold, consider it a click
        if (distance < 5) {
            openIssueModal();
        }
    };

    return (
        <div
            className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between transition-transform transform hover:scale-105 hover:shadow-lg relative cursor-pointer"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
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
                <strong>Reference:</strong> {generateNiceReferenceId(data)}
            </p>

            {/* Attachments */}
            {attachments && attachments.length > 0 && (
                <div className="mb-4 relative">
                    <p className="text-sm text-gray-500 mb-4">
                        <strong>Attachment(s):</strong>
                    </p>
                    <div className="bg-gray-200 rounded-md h-40 flex items-center justify-center relative overflow-hidden">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="loader"></div>
                            </div>
                        )}
                        {isImageError ? (
                            <div className="absolute inset-0 flex items-center justify-center text-red-500">
                                <ExclamationCircleIcon className="h-6 w-6" />
                                <span className="ml-2">Failed to load image</span>
                            </div>
                        ) : (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <div
                                    className="absolute inset-0 bg-cover bg-center filter blur-lg"
                                    style={{ backgroundImage: `url(${attachments[0].signedUrl})` }}
                                ></div>
                                <img
                                    src={attachments[0].signedUrl}
                                    alt="Attachment"
                                    className="relative z-10 rounded-md object-contain max-h-full max-w-full cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closeModal();
                                        handleImageClick(attachments[0].signedUrl);
                                    }}
                                />
                            </div>
                        )}
                        {attachments.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                {attachments.length > 9 ? '9+' : attachments.length}
                                {/* {attachments.length > 9 ? '+9' : `+${attachments.length - 1}`} */}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}