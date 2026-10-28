import { useId } from 'react';

// Mood Musica mark: a smiling face wearing headphones (same artwork as public/logo.svg)
const Logo = ({ size = 34 }) => {
    // Unique gradient id, so several logos on a page don't clash
    const gradientId = useId();

    return (
        <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="logo">
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#8b5cf6" />
                    <stop offset="0.55" stopColor="#ec4899" />
                    <stop offset="1" stopColor="#f59e0b" />
                </linearGradient>
            </defs>
            <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
            <g fill="#fff" transform="translate(0 1.5)">
                <path d="M7.5 16 V15 a8.5 8.5 0 0 1 17 0 V16" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
                <rect x="4" y="15" width="4.5" height="8.5" rx="2.25" />
                <rect x="23.5" y="15" width="4.5" height="8.5" rx="2.25" />
                <circle cx="13.3" cy="16.2" r="1.6" />
                <circle cx="18.7" cy="16.2" r="1.6" />
                <path d="M12.6 20 Q16 23.6 19.4 20" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" />
            </g>
        </svg>
    );
};

export default Logo;
