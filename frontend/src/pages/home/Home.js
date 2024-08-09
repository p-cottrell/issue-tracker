import React from 'react';
import { Link } from 'react-router-dom';
import "./Home.css";

const Home = () => {
    return (
        <div className="home-wrapper">
            <div className="home-container">
                <h1>Welcome to the Intermittent Issue Tracker</h1>
                <p>Track your issues effortlessly.</p>
                <div className="buttons">
                    <Link to="/login">
                        <button className="btn">Login</button>
                    </Link>
                    <Link to="/register">
                        <button className="btn">Sign Up</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;