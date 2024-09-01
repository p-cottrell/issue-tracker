import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import './../../index.css';

/**
 * Login component handles user authentication.
 * Provides form inputs for email and password, validates inputs,
 * and posts credentials to an API. Navigation to the dashboard is triggered on successful authentication.
 */
const Login = () => {
    // State hooks for managing form inputs and error messages
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    /**
     * Validates the email format using a regular expression.
     * @param {string} email - User input email to validate.
     * @returns {boolean} - Returns true if the email is valid, otherwise false.
     */
    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return re.test(String(email).trim().toLowerCase());
    };

    // Hook for navigating programmatically
    const navigate = useNavigate();

    /**
     * Handles form submission.
     * Performs client-side validation before submitting credentials to the server.
     * @param {React.FormEvent} e - The event interface for form submission.
     */
    const onSubmit = async (e) => {
        e.preventDefault();

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            setError('Both email and password are required.');
            return;
        } else if (!validateEmail(trimmedEmail)) {
            setError('Please enter a valid email address.');
            return;
        }

        try {
            const response = await apiClient.post('/api/users/login', {
                email: trimmedEmail,
                password: trimmedPassword,
            });

            if (response.data.success) {
                navigate('/dashboard'); // Navigate to the dashboard on successful login
            } else {
                setError('Invalid login credentials'); // Show error on failed login
            }
        } catch (error) {
            console.error(error);
            setError('An error occurred. Please try again later.'); // Handle server or network errors
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="container my-auto max-w-md border-2 rounded-lg shadow-lg border-secondary p-3 bg-secondary xs:w-11/12">
                <div className="text-center my-6">
                    <h1 className="text-3xl font-semibold text-dark">Sign in</h1>
                    <p className="text-neutral">Sign in to access your account</p>
                </div>

                <div className="m-6">
                    <form className="mb-4" onSubmit={onSubmit}>
                        <div className="mb-6">
                            <label htmlFor="email" className="block mb-2 text-sm text-neutral">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email address"
                                className="w-full px-3 py-2 placeholder-neutral border border-neutral rounded-md focus:outline-none focus:ring focus:ring-accent focus:border-primary bg-neutral text-dark"
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="password" className="text-sm text-neutral">Password</label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Your password"
                                className="w-full px-3 py-2 placeholder-neutral border border-neutral rounded-md focus:outline-none focus:ring focus:ring-accent focus:border-primary bg-neutral text-dark"
                            />
                            <Link to="/forgot-password" className="text-sm text-neutral focus:outline-none hover:text-primary">
                                Forgot password?
                            </Link>
                        </div>
                        {error && <div className="text-sm bg-red-200 text-red-800 p-2 rounded transition-opacity duration-300 ease-in-out">{error}</div>}
                        <div className="mb-6">
                            <button
                                type="submit"
                                className="w-full px-3 py-4 text-white bg-primary rounded-md hover:bg-primaryHover focus:outline-none duration-100 ease-in-out"
                            >
                                Sign in
                            </button>
                        </div>
                        <p className="text-sm text-center text-neutral">
                            Don't have an account yet? <Link to="/register" className="font-semibold text-primary focus:outline-none focus:underline">Sign up</Link>.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;