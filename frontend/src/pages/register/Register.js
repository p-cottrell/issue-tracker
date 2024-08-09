import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/signup', {
                email,
                password,
            });

            console.log('User registered:', response.data);
            // Handle success (e.g., redirect to login page, show success message, etc.)
        } catch (error) {
            console.error('There was an error registering the user:', error);
            // Handle error (e.g., show error message to user)
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
                        value={name}
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