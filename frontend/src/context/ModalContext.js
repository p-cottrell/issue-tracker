import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modals, setModals] = useState([]);

    const openModal = (content, showCloseButton = true) => {
        if (content) {
            setModals((prevModals) => [...prevModals, { content, showCloseButton }]);
        }
        else {
            // Legacy dredge: If you call openModal(null), it previously closed the last modal. This adds support for that.
            closeModal();

            // Also add an obsolete warning with the caller stack trace.
            console.warn('openModal(null) is obsolete and will be removed in the future.', new Error().stack);
        }
    };

    const closeModal = () => {
        setModals((prevModals) => prevModals.slice(0, -1));
    };

    const handleBackgroundClick = (e, index) => {
        if (e.target === e.currentTarget && index === modals.length - 1) {
            closeModal();
        }
    };

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            <div className="relative max-w-full max-h-full">
                {children}
            </div>
            {modals.map((modal, index) => (
                modal.content && (
                    <div
                        key={index}
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                        onClick={(e) => handleBackgroundClick(e, index)}
                    >
                        <div className="relative max-w-3xl w-full max-h-full">
                            {modal.content}
                            {modal.showCloseButton && (
                                <button
                                    onClick={closeModal}
                                    className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75 focus:outline-none"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    </div>
                )
            ))}
        </ModalContext.Provider>
    );
};

export const useModal = () => useContext(ModalContext);