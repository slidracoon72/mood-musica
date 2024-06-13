import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../Navbar.css';

const Navbar = () => {
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        // Function to update display name
        const updateDisplayName = () => {
            const userInfo = sessionStorage.getItem('user_info');
            if (userInfo) {
                const parsedUserInfo = JSON.parse(userInfo);
                setDisplayName(parsedUserInfo.display_name);
            } else {
                setDisplayName('');
            }
        };

        // Update display name on component mount
        updateDisplayName();

        // Add event listener for successful login events
        window.addEventListener('login', updateDisplayName);

        // Cleanup function to remove event listener
        return () => {
            window.removeEventListener('login', updateDisplayName);
        };
    }, []);

    const handleLogin = () => {
        console.log("Login Pressed!");
        window.location.href = 'http://localhost:5000/login';
    };

    const handleLogout = () => {
        // Clear local session storage
        sessionStorage.removeItem('user_info');

        // Make backend call to /logout
        fetch('/logout')
            .then(response => {
                if (response.ok) {
                    setDisplayName(''); // Clear display name upon logout
                } else {
                    console.error('Failed to logout:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Failed to logout:', error.message);
            });
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <NavLink exact to="/" className="nav-link" activeClassName="active">
                                Home 🏠
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/suggested-songs" className="nav-link" activeClassName="active">
                                Suggested Songs 💿
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/liked-songs" className="nav-link" activeClassName="active">
                                Liked Songs ❤️️
                            </NavLink>
                        </li>
                        <li className="nav-item float-right">
                            {displayName ? (
                                <>
                                    <span className="mr-4" style={{ color: '#ccd6f6' }}>
                                        {displayName}
                                    </span>
                                    <span className="logout-link" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                                        Logout
                                    </span>
                                </>
                            ) : (
                                <NavLink onClick={handleLogin} className="login-link">
                                    Login 😀
                                </NavLink>
                            )}
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

