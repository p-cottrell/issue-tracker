import React from 'react';
import "./Home.css";

const Home = () => {
    return (
        <div className="home-wrapper">
            <div className="home-container">
                <h1>Welcome to the Intermittent Issue Tracker</h1>
                <p>Track your intermittent issues effortlessly.</p>
                <div className="buttons">
                    <button className="btn">Login</button>
                    <button className="btn">Sign Up</button>
                </div>
            </div>
        </div>
    );
};

export default Home;