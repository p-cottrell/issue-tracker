import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Logo from '../../components/Logo';
import apiClient from '../../api/apiClient';

const Profile = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState({ username: '', email: '' });
  const [editData, setEditData] = useState({ username: '', email: '', password: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
        try {
          const response = await apiClient.get('api/users/me');
          setUserData(response.data);
          setEditData({ username: response.data.username, email: response.data.email });
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
    fetchUserData();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle form submission for updating user details
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('api/users/update', editData);
      if (response.data.success) {
        setUserData(editData);
        setSuccessMessage('Profile updated successfully.');
        setIsEditing(false);
      } else {
        setErrorMessage('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Error updating profile.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-dark">
      {/* Header */}
      <header className="relative bg-primary shadow p-4 flex items-center justify-between">
        <div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold focus:outline-none transition-transform transform hover:scale-105 hover:shadow-lg flex items-center space-x-2 lg:hidden"
          >
            <span className="text-lg font-bold">☰</span>
          </button>
          <span className="hidden lg:inline">
            <Logo className="truncate text-neutral xs:text-base md:text-lg lg:text-4xl" navigate={navigate} useClick={true} />
          </span>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex flex-grow">
        {/* Sidebar */}
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} navigate={navigate} />

        {/* Main Content */}
        <main className="flex-grow p-6">
          {/* Container for Profile Details */}
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
            <h2 className="text-2xl font-semibold mb-4 text-dark dark:text-neutral">Profile</h2>

            {!isEditing ? (
              <>
                <div className="mb-4">
                  <p className="text-lg font-medium">Username: <span className="text-gray-700 dark:text-gray-300">{userData.username}</span></p>
                  <p className="text-lg font-medium">Email: <span className="text-gray-700 dark:text-gray-300">{userData.email}</span></p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryHover transition-colors"
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={editData.username}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={editData.password}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
                {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                {successMessage && <p className="text-green-500">{successMessage}</p>}
                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryHover transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-300 text-dark px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
