import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import "./Login.css";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();


    const onSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitted");
        try {
            const response = await axios.post('http://localhost:5000/users/login', {
                username,
                password,
            });

            console.log('User Logged In:', response.data);
            navigate('/dashboard');

        } catch (error) {
            console.log('There was an error logging in the user:', error);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <h1>Login</h1>
                <form onSubmit={onSubmit}>
                    <input
                        type="username"
                        placeholder="Username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;