import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { logOut, signIn, useAuthUser } from '../services/authService';
import { toast } from '../services/toastService';

const Navbar = () => {
    const { user, loading } = useAuthUser();
    const [menuOpen, setMenuOpen] = useState(false);
    const closeMenu = () => setMenuOpen(false);

    const handleLogout = () => {
        closeMenu();
        logOut()
            .then(() => toast('Signed out', 'info'))
            .catch(error => {
                console.error('Failed to logout:', error);
                toast('Could not sign out. Please try again.', 'error');
            });
    };

    return (
        <header className="navbar">
            <div className="container nav-inner">
                <Link to="/" className="brand" onClick={closeMenu}>
                    <span className="brand-mark"><i className="fa-solid fa-wave-square" aria-hidden="true"></i></span>
                    Mood Musica
                </Link>

                <button
                    type="button"
                    className="nav-toggle"
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                    aria-controls="primary-navigation"
                    onClick={() => setMenuOpen(open => !open)}
                >
                    <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} aria-hidden="true"></i>
                </button>

                <nav id="primary-navigation" className={`nav-links ${menuOpen ? 'is-open' : ''}`} aria-label="Main">
                    <NavLink end to="/" className="nav-link" onClick={closeMenu}>Discover</NavLink>
                    <NavLink to="/history" className="nav-link" onClick={closeMenu}>History</NavLink>
                    <NavLink to="/favorites" className="nav-link" onClick={closeMenu}>Favorites</NavLink>

                    <div className="nav-auth">
                        {loading ? null : user ? (
                            <>
                                {user.photoURL ? (
                                    <img className="avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
                                ) : (
                                    <span className="avatar avatar-fallback" aria-hidden="true">
                                        {(user.displayName || '?').charAt(0).toUpperCase()}
                                    </span>
                                )}
                                <span className="user-name">{user.displayName}</span>
                                <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { closeMenu(); signIn(); }}>
                                <i className="fa-brands fa-google" aria-hidden="true"></i> Sign in
                            </button>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
