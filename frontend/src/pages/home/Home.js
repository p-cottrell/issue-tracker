import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './../../index.css';
import hero from "./hero.jpg";

/**
 * Home component that serves as the landing page.
 * Includes a dynamic form to capture an email for later use on the registration page,
 * an image, and navigation links.
 */
const Home = () => {
  // State hook to store the user's email input
  const [email, setEmail] = useState('');

  // Hook for programmatically navigating to different routes
  const navigate = useNavigate();

  /**
   * Handles the 'Get Started' button click by navigating to the registration page.
   * Passes the captured email through route state for potential pre-filling.
   */
  const handleGetStarted = () => {
    navigate('/register', { state: { email } });
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full px-4 sm:max-w-xl md:max-w-full lg:max-w-screen-2xl md:px-24 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center bg-background rounded overflow-hidden">
          <div className="relative lg:w-1/2">
            <img
              src={hero}
              alt=""
              className="object-cover w-full h-550 lg:h-full"
            />
            <svg
              className="absolute top-0 right-0 hidden h-full text-background lg:inline-block"
              viewBox="-1 -1 18 104"
              fill="beige"
            >
              <polygon points="17.3036738 0 20 0 20 104 0.824555778 104" />
            </svg>
          </div>
          <div className="flex flex-col justify-center p-8 bg-background lg:p-16 lg:pl-10 lg:w-1/2">
            <h5 className="mb-3 text-secondary font-extrabold leading-none lg:text-3xl md:text-3xl sm:text-2xl xs:text-lg">
              Intermittent Issue Tracker
            </h5>
            <h5 className="mb-3 font-extrabold leading-none lg:text-xl md:text-base sm:text-sm text-secondary">
              Track your issues effortlessly.
            </h5>
            <p className="mb-5 text-secondary">
              <span className="font-bold">Issue Tracker</span> simplifies how you log, track, and analyse issues, enhancing efficiency and productivity.
               It provides a clear platform to manage tasks, offering insights for better decision-making and swift problem resolution.
            </p>

            {/* Form input and button for starting the registration process */}
            <div className="flex w-full justify-between">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 mb-3 border-2 border-secondary rounded placeholder:text-primary hidden sm:block"
              />
              <button
                type="submit"
                onClick={handleGetStarted}
                className="ml-4 xs:ml-0 inline-flex w-48 items-center justify-center h-12 px-6 font-medium rounded shadow-md bg-primary hover:bg-primaryHover text-neutral"
              >
                Get Started
              </button>
            </div>
            <div className="pt-4 text-sm font-semibold leading-none sm:text-base md:text-lg text-secondary">
              Already a member? <Link to="/login" className="text-dark">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;