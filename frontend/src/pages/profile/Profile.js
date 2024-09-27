import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Logo from '../../components/Logo';
import apiClient from '../../api/apiClient';
import PasswordRules from '../../components/PasswordRules';
import { useUser } from '../../context/UserContext';

/**
 * Profile component: Displays and manages user profile information,
 * allows the user to update their username and password, and shows issue stats
 * such as issues in progress, closed issues, and total issues.
 */
const Profile = () => {
  // React Router hook to programmatically navigate between pages
  const navigate = useNavigate();

  // State to store user profile data (username and email)
  const [userData, setUserData] = useState({ username: '', email: '' });

  // State to handle password changes
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State for handling form errors (e.g., passwords don't match, API failures)
  const [errors, setErrors] = useState({});

  // State for displaying success messages (e.g., password or username updated successfully)
  const [successMessage, setSuccessMessage] = useState('');

  // State to control the visibility of the username and password editing fields
  const [isUsernameEditVisible, setUsernameEditVisible] = useState(false);
  const [isPasswordEditVisible, setPasswordEditVisible] = useState(false);

  // State to handle the sidebar's open/close status
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Issue-related stats for the user: in progress, closed, and total issues
  const [issuesInProgress, setIssuesInProgress] = useState(0);
  const [issuesClosed, setIssuesClosed] = useState(0);
  const [totalIssues, setTotalIssues] = useState(0);

  // Password-related states for rules and validation
  const [passwordFocused, setPasswordFocused] = useState(false);

  // New state for dark mode setting
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Fetch user data from the global UserContext
  const { user } = useUser();

  // Load user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get('api/users/me');
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  // Load theme from localStorage when the component mounts
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Function to handle theme toggle
  const handleThemeToggle = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  /**
   * Handles the username change form submission.
   * Validates the username and sends the new username to the API.
   */
  const handleUsernameChange = async () => {
    if (!userData.username.trim()) {
      setErrors({ username: 'Username cannot be empty.' });
      return;
    }

    try {
      const response = await apiClient.put('api/users/update-username', { username: userData.username });

      if (response.data.success) {
        setSuccessMessage('Username updated successfully.');
        setErrors({});
        setUsernameEditVisible(false); // Hide the username edit form
      } else {
        setErrors({ username: 'Failed to update username.' });
      }
    } catch (error) {
      setErrors({ username: 'Error updating username.' });
    }
  };

  /**
   * Handles the password change form submission.
   * If the password and confirm password fields match, sends the new password to the API.
   */
  const handlePasswordChange = async () => {
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }

    if (!validatePassword(password)) return;

    try {
      const response = await apiClient.put('api/users/update-password', { password });
      if (response.data.success) {
        setSuccessMessage('Password updated successfully.');
        setPassword('');
        setConfirmPassword('');
        setErrors({});
        setPasswordEditVisible(false);
      } else {
        setErrors({ password: 'Failed to update password.' });
      }
    } catch (error) {
      setErrors({ password: 'Error updating password.' });
    }
  };

  /**
   * Validates the new password according to specific rules (e.g., length, uppercase, number, etc.)
   * @param {string} password - The password to validate
   * @returns {boolean} - True if the password is valid, false otherwise
   */
  const validatePassword = (password) => {
    if (password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters long.' });
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setErrors({ password: 'Password must include at least one uppercase letter.' });
      return false;
    }
    if (!/\d/.test(password)) {
      setErrors({ password: 'Password must include at least one number.' });
      return false;
    }
    if (!/[\W_]/.test(password)) {
      setErrors({ password: 'Password must include at least one special character.' });
      return false;
    }
    if (/\s/.test(password)) {
      setErrors({ password: 'Password must not contain spaces.' });
      return false;
    }
    return true;
  };

  const toggleUsernameEdit = () => {
    setUsernameEditVisible((prev) => !prev); // Switch between showing and hiding the form
  };

  const togglePasswordEdit = () => {
    setPasswordEditVisible((prev) => !prev); // Switch between showing and hiding the form
  };

  const cancelUsernameEdit = () => {
    setUsernameEditVisible(false); // Simply hides the form
  };

  const cancelPasswordEdit = () => {
    setPasswordEditVisible(false); // Simply hides the form
  };

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    setPasswordFocused(false);
  };

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await apiClient.get(`api/issues?userId=${user.id}`);
        if (response.data && Array.isArray(response.data.data)) {
          const issues = response.data.data;
          const inProgressCount = issues.filter(issue => {
            if (!issue.status_history || issue.status_history.length === 0) return false;
            const latestStatus = issue.status_history[issue.status_history.length - 1].status_id;
            return latestStatus === 2;
          }).length;

          const closedCount = issues.filter(issue => {
            if (!issue.status_history || issue.status_history.length === 0) return false;
            const latestStatus = issue.status_history[issue.status_history.length - 1].status_id;
            return latestStatus === 1;
          }).length;

          setIssuesInProgress(inProgressCount);
          setIssuesClosed(closedCount);
          setTotalIssues(issues.length);
        }
      } catch (error) {
        console.error('Error fetching issues:', error);
      }
    };

    if (user?.id) {
      fetchIssues();
    }
  }, [user.id]);

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

      {/* Main content */}
      <div className="flex flex-grow">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} navigate={navigate} />
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Profile Section */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <img
                src="https://i.pravatar.cc/150"
                alt="Profile"
                className="w-32 h-32 rounded-full mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold">{userData.username}</h2>
              <p className="text-lg mb-2">{userData.email}</p>
              <ul className="mt-4 space-y-2 text-center">
                <li className="text-gray-700">Issues in progress: <span className="text-green-500">{issuesInProgress}</span></li>
                <li className="text-gray-700">Issues closed: <span className="text-red-500">{issuesClosed}</span></li>
                <li className="text-gray-700">Total issues: <span className="text-gray-500">{totalIssues}</span></li>
              </ul>
            </div>

            {/* Account Details and Theme Settings */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md sm:flex sm:flex-col sm:items-center">
              <h3 className="text-2xl font-bold mb-6 text-center">Update Account Details</h3>

              {/* Username Editing */}
              {isUsernameEditVisible ? (
                <div className="mb-6 w-full sm:w-2/3">
                  <label className="block text-gray-700 px-2">Username</label>
                  <input
                    type="text"
                    value={userData.username}
                    className="w-full mt-1 p-2 border rounded-lg"
                    onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <button onClick={handleUsernameChange} className="bg-primary text-white py-2 rounded-lg w-full">Save</button>
                    <button onClick={cancelUsernameEdit} className="bg-red-500 text-white py-2 rounded-lg w-full">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="w-full sm:w-2/3">
                  <button onClick={toggleUsernameEdit} className="mt-4 mb-4 bg-primary text-white py-2 rounded-lg w-full">Update Username</button>
                </div>
              )}

              {/* Password Editing */}
              <div className="w-full sm:w-2/3">
                {isPasswordEditVisible ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 px-2">New Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-lg"
                        placeholder="Enter new password"
                        onFocus={handlePasswordFocus}
                        onBlur={handlePasswordBlur}
                      />
                      {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>
                    <div>
                      <label className="block text-gray-700 px-2">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-lg"
                        placeholder="Confirm new password"
                      />
                      {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                    </div>

                    {/* Password rules visible when focused */}
                    <div className="col-span-1 sm:col-span-2">
                      {passwordFocused && <PasswordRules password={password} />}
                    </div>

                    <div className="col-span-1 sm:col-span-2 flex justify-center mt-2 space-x-4">
                      <button onClick={handlePasswordChange} className="bg-primary text-white py-2 px-6 rounded-lg w-1/2">Save</button>
                      <button onClick={cancelPasswordEdit} className="bg-red-500 text-white py-2 px-6 rounded-lg w-1/2">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <button onClick={togglePasswordEdit} className="mb-4 bg-primary text-white py-2 rounded-lg w-full">Update Password</button>
                  </div>
                )}
              </div>

              {/* Theme Settings */}
              <div className="w-full sm:w-2/3 mt-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Theme Settings</h3>
                <div className="flex items-center justify-between">
                  <span className="text-dark dark:text-neutral">Dark Mode</span>
                  <button
                    onClick={handleThemeToggle}
                    className='dark:bg-primary bg-gray-300 relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none'
                  >
                    <span className={`${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
                  </button>
                </div>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="mt-4 p-2 bg-green-100 text-green-700 rounded-lg w-full sm:w-2/3">
                  {successMessage}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
