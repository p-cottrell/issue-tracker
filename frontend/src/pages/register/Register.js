import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import './../../index.css';
import PasswordRules from './../../components/PasswordRules';

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
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [showPasswordRules, setShowPasswordRules] = useState(false);


    /**
     * UseEffect to manage password focus state with a delay. If we don't use this the user will click on the submit buton
     * but it won't register because the password rules disappear too quick and the submit button will have moved. All this
     * does is delay that by 200 milliseconds.
     */
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

    /**
     * Validates the email address against a regular expression.
     * @param {string} email - Email address to validate.
     * @returns {boolean} - True if the email is valid; otherwise, false.
     */
    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return re.test(String(email).trim().toLowerCase());
    };

    /**
     * Validates the password to ensure it meets the specified criteria:
     * - Minimum length of 8 characters
     * - Includes at least one uppercase letter
     * - Includes at least one number
     * - Includes at least one special character
     * - Does not contain spaces
     * @param {string} password - Password to validate.
     * @returns {boolean} - True if the password is valid; otherwise, false.
     */
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

    /**
     * Handles the form submission.
     * Validates input fields and submits the registration request to the server.
     * @param {React.FormEvent<HTMLFormElement>} e - Form event.
     */
    const onSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setError('Email is required.');
            return;
        }

        if (!username.trim()) {
            setError('Username is required.');
            return;
        }

        if (!password.trim()) {
            setError('Password is required.');
            return;
        }

        if (!validateEmail(email.trim())) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!validatePassword(password.trim())) {
            // Error message is set inside the validatePassword function
            return;
        }

        try {
            const response = await apiClient.post('/api/users/register', {
                username,
                email: email.trim(),
                password: password.trim(),
            });

            if (response.data.success) {
                navigate('/dashboard'); // Navigate to dashboard on successful registration
            } else if (response.data.error) {
                setError(response.data.error); // Set the error from the server response
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error);
            } else {
                setError('An error occurred. Please try again later.');
            }
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="container my-auto max-w-md border-2 rounded-lg shadow-lg border-secondary p-3 bg-secondary xs:w-11/12">
                <div className="text-center my-6">
                    <h1 className="text-3xl font-semibold text-dark">Register</h1>
                    <p className="text-neutral">Create your account</p>
                </div>

                <div className="m-6">
                    <form className="mb-4" onSubmit={onSubmit}>
                        <div className="mb-6">
                            <label htmlFor="email" className="block mb-2 text-sm text-neutral">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                autoComplete='email'
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border-neutral rounded-md focus:outline-none focus:ring focus:ring-accent focus:border-primary bg-neutral text-dark"
                            />
                        </div>
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
                        <div className="mb-6">
                            <button
                                type="submit"
                                className="w-full px-3 py-4 text-white bg-primary rounded-md hover:bg-primaryHover focus:outline-none duration-100 ease-in-out"
                            >
                                Register
                            </button>
                        </div>
                        <p className="text-sm text-center text-neutral">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-primary focus:outline-none focus:underline">Sign in</Link>.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
