import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modalContent, setModalContent] = useState(null);
    const [showCloseButton, setShowCloseButton] = useState(true);

    const openModal = (content, showCloseButton = true) => {
        setModalContent(content);
        setShowCloseButton(showCloseButton);
    };

    const closeModal = () => {
        setModalContent(null);
        setShowCloseButton(true);
    };

    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            <div className="relative max-w-full max-h-full">
                {children}
            </div>
            {modalContent && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                    onClick={handleBackgroundClick}
                >
                    <div className="relative max-w-3xl w-full max-h-full">
                        {modalContent}
                        {showCloseButton && (
                            <button
                                onClick={closeModal}
                                className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75 focus:outline-none"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
};

export const useModal = () => useContext(ModalContext);