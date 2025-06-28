import React from 'react';
import { Link } from 'react-router-dom';
import './Homepage.css';

function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title">TaskGrid</h1>
      <Link to="/login" className="home-button">
        Login
      </Link>
    </div>
  );
}

export default Home;