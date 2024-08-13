import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./Login.css";





const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // useNavigate to navigate to different routes
    const navigate = useNavigate();

    // configure the API depending on the environment
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    // Form submission handler
    const onSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior

        // Basic client-side validation to ensure username and password are not empty
        if (!username || !password) {
            setError('Username and password are required');
            return;
        }

        try {
            // Make an API request to the server to log in the user
            const response = await axios.post(`${API_URL}/users/login`, {
                username,
                password,
            });

            // If successful, log the response and navigate to the dashboard
            if (response.data.success) {
                console.log('User Logged In:', response.data);
                navigate('/dashboard');

            } else {
                // If the server response indicates a failure, set an error message
                setError('Invalid login credentials');
                console.log('Login Failed: ', response.data);
            }

        } catch (error) {
            // If an error occurs
            console.log(error);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <h1>Login</h1>

                {/* Display error message if there is one */}
                {error && <p className="error">{error}</p>}

                <form onSubmit={onSubmit}>
                    {/* Username input field */}
                    <input
                        type="text"
                        id="username"
                        placeholder="Username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        aria-label="Username"
                    />

                    {/* Password input field */}
                    <input
                        type="password"
                        id="password"
                        placeholder="Password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {/* Submit button */}
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;