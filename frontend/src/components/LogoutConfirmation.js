const LogoutConfirmation = ({ onConfirm, onCancel }) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded shadow-lg text-center">
          <h2 className="text-lg text-dark font-semibold mb-4">Are you sure you want to logout?</h2>
          <div className="flex justify-center">
            <button
              className="mr-4 px-6 py-2 bg-primary text-white rounded hover:bg-primaryHover"
              onClick={onConfirm}
            >
              Yes
            </button>
            <button
              className="px-6 py-2 bg-gray-300 text-dark rounded hover:bg-gray-400"
              onClick={onCancel}
            >
              No
            </button>
          </div>
        </div>
      </div>
    );
  };


export default LogoutConfirmation;