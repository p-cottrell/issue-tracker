import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import LogoutConfirmation from './LogoutConfirmation';

const Sidebar = ({ isCollapsed, toggleCollapse }) => {
  const navigate = useNavigate(); // Initialize the navigate function
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false); // State to control logout popup visibility


  // Define the profile route handler function
  const handleProfile = () => {
    navigate('/profile');
  };

  // Define the settings route handler function
  const handleSettings = () => {
    navigate('/settings');
  };


  // Define the logout handler function
  const handleLogout = async () => {
    if (!showLogoutConfirmation) {
      // Show confirmation popup
      setShowLogoutConfirmation(true);
      return;
    }

    try {
      // Make the API request to log out the user
      await apiClient.post('/api/users/logout');
      // Redirect to the login after logout
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      // Handle the error (e.g., show an error message)
    } finally {
      // Hide the confirmation popup
      setShowLogoutConfirmation(false);
    }
  };

  // Define the function to cancel the logout
  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };



  // Nav items data
  const navItems = [
    {
      text: 'Add Issue',
      path: 'M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z',
      href: "#",
    },
    {
      text: 'Button 2',
      path: 'M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z',
    },
    {
      text: 'Button 3',
      path: 'M6.912 3a3 3 0 00-2.868 2.118l-2.411 7.838a3 3 0 00-.133.882V18a3 3 0 003 3h15a3 3 0 003-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0017.088 3H6.912zm13.823 9.75l-2.213-7.191A1.5 1.5 0 0017.088 4.5H6.912a1.5 1.5 0 00-1.434 1.059L3.265 12.75H6.11a3 3 0 012.684 1.658l.256.513a1.5 1.5 0 001.342.829h3.218a1.5 1.5 0 001.342-.83l.256-.512a3 3 0 012.684-1.658h2.844z',
    },
    {
      text: 'Profile',
      path: 'M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z',
      onClick: handleProfile,
    },
    {
      text: 'Settings',
      path: 'M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z',
      onClick: handleSettings,
    },
    {
      text: 'Log Out',
      path: 'M12 2.25a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM6.166 5.106a.75.75 0 010 1.06 8.25 8.25 0 1011.668 0 .75.75 0 111.06-1.06c3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788a.75.75 0 011.06 0z',
      onClick: handleLogout,
    },
  ];

  return (
    <>
      {/* Toggle Button for Collapsing Sidebar */}
      <button
        className=" pl-1 text-neutral hover:text-primary fixed top-4 left-4 z-50"
        onClick={toggleCollapse}
      >
        {/* Icon to indicate collapse or expand */}
        {isCollapsed ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10 pl-2">
            <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen flex flex-col bg-clip-border bg-secondary text-neutral transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[4rem]' : 'w-[20rem]'
        }`}
        style={{ overflow: 'hidden' }}
      >
        <nav className="flex flex-col gap-1 pt-16 pl-4 font-sans text-base font-normal text-neutral items-center">
          {navItems.map((item, index) => (
            <NavItem key={index} item={item} isSidebarCollapsed={isCollapsed} />
          ))}
        </nav>
      </div>
      {/* Logout Confirmation Popup */}
      {showLogoutConfirmation && (
        <LogoutConfirmation onConfirm={handleLogout} onCancel={cancelLogout} />
      )}
    </>
  );
};

const NavItem = ({ item, isSidebarCollapsed }) => {
  return (
    <div
      role="button"
      tabIndex="0"
      className={`flex items-center ${
        isSidebarCollapsed ? 'justify-center' : 'justify-start'
      } w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-accent hover:bg-opacity-80 focus:bg-accent focus:bg-opacity-80 active:bg-neutral active:bg-opacity-80 hover:text-primaryHover focus:text-primaryHover active:text-primary outline-none`}
      onClick={item.onClick}
    >
      <div className="grid place-items-center mr-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={`h-5 w-5 ${isSidebarCollapsed ? 'mx-auto' : ''}`}
        >
          <path fillRule="evenodd" d={item.path} clipRule="evenodd" />
        </svg>
      </div>
      {/* Conditionally render the item text based on sidebar state */}
      {!isSidebarCollapsed && item.text}
      {item.badge && !isSidebarCollapsed && (
        <div className="grid place-items-center ml-auto justify-self-end">
          <div
            className="relative grid items-center font-sans font-bold uppercase whitespace-nowrap select-none bg-secondary text-neutral py-1 px-2 text-xs rounded-full"
            style={{ opacity: 1 }}
          >
            <span>{item.badge}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;