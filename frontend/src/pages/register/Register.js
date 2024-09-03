import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import PasswordRules from './../../components/PasswordRules';
import './../../index.css';

/**
 * Register component for handling user registration with validation.
 * It accepts username, email, and password, validates them,
 * and registers the user if all validations pass.
 * Redirects to the dashboard upon successful registration.
 */
const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State for managing user inputs and validation error message
    const [email, setEmail] = useState(location.state?.email || '');
    const [username, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [showPasswordRules, setShowPasswordRules] = useState(false);
    const [step, setStep] = useState(1);

    useEffect(() => {
        const handleFocus = passwordFocused;
        const timer = setTimeout(() => {
            setShowPasswordRules(handleFocus);
        }, 200);

        return () => clearTimeout(timer);
    }, [passwordFocused]);

    const handlePasswordFocus = () => {
        setPasswordFocused(true);
    };

    const handlePasswordBlur = () => {
        setPasswordFocused(false);
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setEmailError(''); // Clear email error when the email input changes
    };

    const handleEmailSubmit = () => {
        if (!email.trim()) {
            setEmailError('Email is required.');
            return;
        }

        if (!validateEmail(email.trim())) {
            setEmailError('Please enter a valid email address.');
            return;
        }

        checkEmailAvailability();
    };

    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        const valid = re.test(String(email).trim().toLowerCase());
        console.log('Email validation:', valid);
        return valid;
    };

    const validatePassword = (password) => {
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return false;
        }
        if (!/[A-Z]/.test(password)) {
            setError('Password must include at least one uppercase letter.');
            return false;
        }
        if (!/\d/.test(password)) {
            setError('Password must include at least one number.');
            return false;
        }
        if (!/[\W_]/.test(password)) {
            setError('Password must include at least one special character.');
            return false;
        }
        if (/\s/.test(password)) {
            setError('Password must not contain spaces.');
            return false;
        }
        return true;
    };

    const checkEmailAvailability = async () => {
        try {
            const response = await apiClient.post('/api/users/check_email', { email: email.trim() });
            if (response.data.taken) {
                setEmailError('Email is already in use.');
            } else {
                setStep(2);
            }
        } catch (error) {
            setEmailError('An error occurred while checking email availability.');
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (step === 1) {
            if (!email.trim()) {
                setEmailError('Email is required.');
                return;
            }

            if (!validateEmail(email.trim())) {
                setEmailError('Please enter a valid email address.');
                return;
            }

            await checkEmailAvailability();
        } else {
            if (!username.trim()) {
                setError('Username is required.');
                return;
            }

            if (!password.trim()) {
                setError('Password is required.');
                return;
            }

            if (!validatePassword(password.trim())) {
                return;
            }

            try {
                const response = await apiClient.post('/api/users/register', {
                    username,
                    email: email.trim(),
                    password: password.trim(),
                });

                if (response.data.success) {
                    navigate('/dashboard');
                } else if (response.data.error) {
                    setError(response.data.error);
                }
            } catch (error) {
                if (error.response && error.response.data && error.response.data.error) {
                    setError(error.response.data.error);
                } else {
                    setError('An error occurred. Please try again later.');
                }
            }
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container my-auto max-w-md border-2 rounded-lg shadow-lg border-secondary p-3 bg-secondary xs:w-11/12"
            >
                <div className="text-center my-6">
                    <h1 className="text-3xl font-semibold text-dark">Register</h1>
                    <p className="text-neutral">Create your account</p>
                </div>

                <div className="m-6">
                    <form className="mb-4" onSubmit={onSubmit}>
                        {step === 1 && (
                            <div className="mb-6">
                                <label htmlFor="email" className="block mb-2 text-sm text-neutral">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    autoComplete='email'
                                    autoFocus
                                    value={email}
                                    onChange={handleEmailChange}
                                    className="w-full px-3 py-2 border-neutral rounded-md focus:outline-none focus:ring focus:ring-accent focus:border-primary bg-neutral text-dark"
                                />
                                {emailError && <div className="text-sm bg-red-200 text-red-800 p-2 rounded transition-opacity duration-300 ease-in-out">{emailError}</div>}
                                <div className="mt-6">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        onClick={handleEmailSubmit}
                                        className="w-full px-3 py-4 text-white bg-primary rounded-md hover:bg-primaryHover focus:outline-none duration-100 ease-in-out"
                                    >
                                        Next
                                    </motion.button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <>
                                <div className="mb-6">
                                    <label htmlFor="username" className="block mb-2 text-sm text-neutral">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        id="username"
                                        autoComplete="username"
                                        value={username}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-2 placeholder-neutral border border-neutral rounded-md focus:outline-none focus:ring focus:ring-accent focus:border-primary bg-neutral text-dark"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="password" className="block mb-2 text-sm text-neutral">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        id="password"
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Your password"
                                        className="w-full px-3 py-2 placeholder-neutral border border-neutral rounded-md focus:outline-none focus:ring focus:ring-accent focus:border-primary bg-neutral text-dark"
                                        onFocus={handlePasswordFocus}
                                        onBlur={handlePasswordBlur}
                                    />
                                    <div className='mt-6'>
                                        {showPasswordRules && <PasswordRules password={password} />}
                                    </div>
                                </div>
                                {error && <div className="text-sm bg-red-200 text-red-800 p-2 rounded transition-opacity duration-300 ease-in-out">{error}</div>}
                                <div className="mb-6 flex justify-between">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        onClick={() => {
                                            setStep(1);
                                            setName('');
                                            setPassword('');
                                        }}
                                        className="px-3 py-4 text-white bg-secondary rounded-md hover:bg-secondaryHover focus:outline-none duration-100 ease-in-out"
                                    >
                                        Back
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        className="px-3 py-4 text-white bg-primary rounded-md hover:bg-primaryHover focus:outline-none duration-100 ease-in-out"
                                    >
                                        Register
                                    </motion.button>
                                </div>
                            </>
                        )}
                    </form>
                    {step === 1 && (
                        <p className="text-sm text-center text-neutral">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-primary focus:outline-none focus:underline">Sign in</Link>.
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Register;