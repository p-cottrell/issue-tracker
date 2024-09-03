import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../api/apiClient';
import ScrollingBackground from '../../components/ScrollingBackground';
import './../../index.css';
import hero from "./hero.jpg";

/**
 * Home component that serves as the landing page.
 * Includes a dynamic form to capture an email for later use on the registration page,
 * an image, and navigation links.
 */
const Home = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        console.log('User is authenticated');
        navigate('/dashboard');
      }
      else {
        console.log('User is not authenticated');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleGetStarted = () => {
    navigate('/register', { state: { email } });
  };

  return (
    <div>
      <ScrollingBackground />
      <div className="relative z-10">
        <motion.div
          className="flex justify-center items-center min-h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="w-full px-4 sm:max-w-xl md:max-w-full lg:max-w-screen-2xl md:px-24 lg:px-8">
            <motion.div
              className="flex flex-col lg:flex-row items-center bg-background rounded overflow-hidden shadow-lg"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="relative lg:w-1/2">
                <motion.img
                  src={hero}
                  alt=""
                  className="object-cover w-full h-550 lg:h-full"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1 }}
                />
                <svg
                  className="absolute top-0 right-0 hidden h-full text-background lg:inline-block"
                  viewBox="-1 -1 18 104"
                  fill="var(--color-background)"
                >
                  <polygon points="17.3036738 0 20 0 20 104 0.824555778 104" />
                </svg>
              </div>
              <div className="flex flex-col justify-center p-8 bg-background lg:p-16 lg:pl-10 lg:w-1/2">
                <motion.h5
                  className="mb-3 text-secondary font-extrabold leading-none lg:text-3xl md:text-3xl sm:text-2xl xs:text-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  Intermittent Issue Tracker
                </motion.h5>
                <motion.h5
                  className="mb-3 font-extrabold leading-none lg:text-xl md:text-base sm:text-sm text-secondary"
                  whileHover={{ scale: 1.06 }}
                >
                  Track your issues effortlessly.
                </motion.h5>
                <motion.p
                  className="mb-5 text-secondary"
                  whileHover={{ scale: 1.03 }}
                >
                  <span className="font-bold">Issue Tracker</span> simplifies how you log, track, and analyse issues, enhancing efficiency and productivity.
                  Use our platform to clearly manage tasks, get insights into better decision-making, and achieve swift problem resolution.
                </motion.p>

                {/* Get Started sign-up form */}
                <div className="flex w-full justify-between">
                  <motion.input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 px-4 mb-3 border-2 border-secondary rounded placeholder:text-primary hidden sm:block"
                    whileFocus={{ borderColor: '#4A90E2' }}
                  />
                  <motion.button
                    type="submit"
                    onClick={handleGetStarted}
                    className="ml-4 xs:ml-0 inline-flex w-48 items-center justify-center h-12 px-6 font-medium rounded shadow-md bg-primary hover:bg-primaryHover text-neutral"
                    whileHover={{ scale: 1.05 }}
                  >
                    Get Started
                  </motion.button>
                </div>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                >
                  {/* Alternate Sign-in link */}
                  <motion.div
                    className="pt-4 text-sm font-semibold leading-none sm:text-base md:text-lg text-secondary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                  >
                    Already a member?{' '}
                    <motion.span
                      className="text-dark"
                      whileHover={{ color: '#4A90E2' }} // Change to main accent color on hover
                    >
                      <Link to="/login">Sign in</Link>
                    </motion.span>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;