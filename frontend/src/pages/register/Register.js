import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './Register.css';

const Register = () => {
    const [username, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    // configure the API depending on the environment
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${API_URL}/users/login`, {
                username,
                email,
                password,
            });

            console.log('User registered:', response.data);
            navigate('/dashboard');
        } catch (error) {
            console.log('There was an error registering the user:', error);
        }
    };

    return (
        <div className="register-wrapper">
            <div className="register-container">
                <h1>Register</h1>
                <form onSubmit={onSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        name="username"
                        value={username}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Register</button>
                </form>
            </div>
        </div>
    );
};

export default Register;