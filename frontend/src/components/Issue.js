import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Issue({ data }) {
    const navigate = useNavigate();

    const getStatusClass = () => {
        switch (data.status_id) {
            case 1:
                return 'bg-green-500 text-white';
            case 2:
                return 'bg-yellow-500 text-white';
            case 3:
                return 'bg-red-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getStatusText = () => {
        switch (data.status_id) {
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

    return (
        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between transition-transform transform hover:scale-105 hover:shadow-lg relative">
            {/* Header Line */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex justify-center items-center text-lg">
                        {data.charm}
                    </div>
                    <h3 className="ml-4 text-lg font-semibold text-gray-800 line-clamp-2 overflow-hidden text-ellipsis">
                        {data.title}
                    </h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass()}`}>
                    {getStatusText()}
                </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-4">{data.description}</p>

            {/* Reference */}
            <p className="text-sm text-gray-500 mb-4">
                <strong>Reference:</strong> {data._id}
            </p>

            {/* Attachments */}
            <div className="mb-4">
                <strong className="block mb-2 text-gray-700">Attachment(s):</strong>
                <div className="bg-gray-200 rounded-md h-40 flex items-center justify-center">
                    <img
                        src={`https://picsum.photos/seed/${data._id}/250/150`}
                        alt="Attachment"
                        className="rounded-md object-cover"
                    />
                </div>
            </div>

            {/* View More Button */}
            <button
                onClick={() => navigate(`/issues/${data._id}`)}
                className="mt-auto bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                View More
            </button>
        </div>
    );
}
