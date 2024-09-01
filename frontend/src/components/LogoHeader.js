import React from 'react';

const LogoHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 flex justify-center items-center bg-secondary h-16 z-50 pt-2">
      {/* Logo */}
        <h1 className='text-neutral xs:text-base md:text-lg lg:text-4xl'>Intermittent Issue Tracker</h1>
    </header>
  );
};

export default LogoHeader;