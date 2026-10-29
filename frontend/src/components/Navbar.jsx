import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { logOut, signIn, useAuthUser } from '../services/authService';
import { toast } from '../services/toastService';
import Logo from './Logo';

const NavLinks = ({ onHome, onNavigate }) => (
    <>
        {/* "Discover" returns to the start screen when already on it, and otherwise brings back the current song */}
        <NavLink end to="/" state={onHome ? { startOver: true } : undefined} className="nav-link" onClick={onNavigate}>Discover</NavLink>
        <NavLink to="/history" className="nav-link" onClick={onNavigate}>History</NavLink>
        <NavLink to="/favorites" className="nav-link" onClick={onNavigate}>Favorites</NavLink>
    </>
);

// Lives inside the glass capsule, so controls use fills rather than more glass
const AuthControls = ({ user, loading, onSignIn, onLogout }) => {
    if (loading) return null;
    if (!user) {
        return (
            <button type="button" className="nav-signin" onClick={onSignIn}>
                <i className="fa-brands fa-google" aria-hidden="true"></i> Sign in
            </button>
        );
    }
    return (
        <>
            {user.photoURL ? (
                <img className="avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
            ) : (
                <span className="avatar avatar-fallback" aria-hidden="true">
                    {(user.displayName || '?').charAt(0).toUpperCase()}
                </span>
            )}
            <span className="user-name">{user.displayName}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
        </>
    );
};

const Navbar = () => {
    const { user, loading } = useAuthUser();
    const { pathname } = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const headerRef = useRef(null);
    const tabsRef = useRef(null);
    const indicatorRef = useRef(null);
    const onHome = pathname === '/';
    const closeMenu = () => setMenuOpen(false);

    // Slide the selection pill under the active tab
    useLayoutEffect(() => {
        const tabs = tabsRef.current;
        const indicator = indicatorRef.current;
        if (!tabs || !indicator) return undefined;

        const place = () => {
            const active = tabs.querySelector('.nav-link.active');
            indicator.style.setProperty('--indicator-width', `${active ? active.offsetWidth : 0}px`);
            indicator.style.setProperty('--indicator-x', `${active ? active.offsetLeft : 0}px`);
        };
        place();
        const observer = new ResizeObserver(place);
        observer.observe(tabs);
        return () => observer.disconnect();
    }, [pathname]);

    // Close the mobile menu on Escape or a click outside the navigation
    useEffect(() => {
        if (!menuOpen) return undefined;
        const onKeyDown = (event) => {
            if (event.key === 'Escape') setMenuOpen(false);
        };
        const onPointerDown = (event) => {
            if (!headerRef.current?.contains(event.target)) setMenuOpen(false);
        };
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('pointerdown', onPointerDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('pointerdown', onPointerDown);
        };
    }, [menuOpen]);

    const handleSignIn = () => {
        closeMenu();
        signIn();
    };

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
        <header className="navbar" ref={headerRef}>
            <div className="container" style={{ position: 'relative' }}>
                <div className="nav-capsule glass glass-large">
                    {/* The logo always returns to the start screen */}
                    <Link to="/" state={{ startOver: true }} className="brand" onClick={closeMenu}>
                        <Logo />
                        Mood Musica
                    </Link>

                    <nav className="nav-tabs" ref={tabsRef} aria-label="Main">
                        <span className="nav-indicator" ref={indicatorRef} aria-hidden="true" />
                        <NavLinks onHome={onHome} />
                    </nav>

                    <div className="nav-auth">
                        <AuthControls user={user} loading={loading} onSignIn={handleSignIn} onLogout={handleLogout} />
                    </div>

                    <button
                        type="button"
                        className="nav-toggle"
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-navigation"
                        onClick={() => setMenuOpen(open => !open)}
                    >
                        <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} aria-hidden="true"></i>
                    </button>
                </div>

                {menuOpen && (
                    <nav id="mobile-navigation" className="nav-menu glass glass-large" aria-label="Main">
                        <NavLinks onHome={onHome} onNavigate={closeMenu} />
                        <div className="nav-auth">
                            <AuthControls user={user} loading={loading} onSignIn={handleSignIn} onLogout={handleLogout} />
                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
};

export default Navbar;
