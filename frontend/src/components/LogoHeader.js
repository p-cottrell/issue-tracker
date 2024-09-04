import React from 'react';
import { Logo } from './Logo';

const LogoHeader = ({ navigate, className, logoClassName }) => {
  return (
    <header className={`fixed top-0 left-0 right-0 flex justify-center items-center bg-secondary h-16 z-50 pt-2 ${className}`}>
      {/* Logo */}
      <Logo className={`w-full ${logoClassName}`} navigate={navigate} />
    </header>
  );
};

export default LogoHeader;