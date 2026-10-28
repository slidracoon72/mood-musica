import { NavLink } from 'react-router-dom';
import { logOut, signIn, useAuthUser } from '../services/authService';
import '../Navbar.css';

const Navbar = () => {
    const { user, loading } = useAuthUser();

    const handleLogout = () => {
        logOut().catch(error => console.error('Failed to logout:', error));
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <NavLink end to="/" className="nav-link">
                                Home 🏠
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/suggested-songs" className="nav-link">
                                Suggested Songs 💿
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/liked-songs" className="nav-link">
                                Liked Songs ❤️️
                            </NavLink>
                        </li>
                        <li className="nav-item float-right">
                            {loading ? null : user ? (
                                <>
                                    <span className="mr-4" style={{ color: '#ccd6f6' }}>
                                        {user.displayName}
                                    </span>
                                    <button type="button" className="logout-link nav-button" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <button type="button" className="login-link nav-button" onClick={signIn}>
                                    Login 😀
                                </button>
                            )}
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
