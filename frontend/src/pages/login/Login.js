import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./Login.css";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [userID, setUserID] = useState(null);
    const [token, setToken] = useState(null);


    // useNavigate to navigate to different routes
    const navigate = useNavigate();

    // configure the API depending on the environment
    const API_URL = process.env.API_URL || 'http://localhost:5000';
    // Form submission handler
    const onSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior

        // Basic client-side validation to ensure email and password are not empty
        if (!email || !password) {
            setError('Email and password are required');
            return;
        }

        try {
            // Make an API request to the server to log in the user
            const response = await axios.post(`${API_URL}/api/users/login`, {
                email,
                password,
            }, {withCredentials: true});


            // If successful, log the response and navigate to the dashboard
            if (response.data.success) {
                setUserID(response.data.userID);
                setToken(response.data.token);
                localStorage.setItem('token', response.data.token); // Store the token in local storage
                localStorage.setItem('userID', response.data.userID);// Store the userID in local storage
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
                    {/* Email input field */}
                    <input
                        type="text"
                        id="email"
                        placeholder="Email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-label="Email"
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