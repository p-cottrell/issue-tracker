import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./Home.css";

const Home = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();


    const handleGetStarted = () => {
        navigate('/register', { state: { email } });
    };


    return (
        <div className="home-wrapper">
            <div className="home-container">
                <div className="home-header">
                    <h1>Intermittent Issue Tracker</h1>
                    <h2>Track your issues effortlessly.</h2>
                </div>
                <div className="home-image-container">
                    <img
                        className="home-image"
                        src="https://loremflickr.com/300/200/kitten"
                        alt="Placeholder"
                    />
                    <div className="text-container">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        </p>
                        <div className="email-container">
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button className="btn-get-started" onClick={handleGetStarted}>
                                GET STARTED
                            </button>
                        </div>
                        <div className="sign-in-text">
                            Already a member? <Link to="/login">Sign in</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
