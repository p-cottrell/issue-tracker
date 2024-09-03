import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import ScrollingBackground from '../../components/ScrollingBackground';
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
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <ScrollingBackground />
            <div className="relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
                >
                    <h2 className="text-2xl font-semibold text-center text-dark mb-6">Login</h2>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <form onSubmit={onSubmit}>
                        <div className="mb-4">
                            <label className="block text-dark mb-2" htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                autoComplete="email"
                                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@example.com"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-dark mb-2" htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                required
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full bg-primary text-white py-2 rounded hover:bg-primaryHover transition duration-200"
                            type="submit"
                        >
                            Login
                        </motion.button>
                    </form>
                    <p className="text-center text-dark mt-4">
                        Don't have an account yet? <Link to="/register" className="font-semibold text-primary focus:outline-none focus:underline">Sign up</Link>.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;