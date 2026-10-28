const YEAR = new Date().getFullYear();

const Footer = () => (
    <footer className="footer">
        <div className="container footer-inner">
            <span>© {YEAR} Mood Musica</span>
            <div className="footer-links">
                <span><i className="fa-solid fa-shield-halved" aria-hidden="true"></i> Face detection runs on your device</span>
                <span>Music by <a href="https://www.deezer.com" target="_blank" rel="noopener noreferrer">Deezer</a></span>
                <a href="https://github.com/slidracoon72/mood-musica" target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-github" aria-hidden="true"></i> Source
                </a>
            </div>
        </div>
    </footer>
);

export default Footer;
