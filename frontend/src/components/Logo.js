import React from 'react';

const Logo = ({ navigate, className }) => {
  return (
    <button className={` ${className}`} onClick={() => navigate('/')}>
      <span>Intermittent Issue Tracker</span>
    </button>
  );
};

export default Logo;