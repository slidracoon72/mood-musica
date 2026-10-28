import { useEffect, useState } from 'react';
import { subscribeToToasts } from '../services/toastService';

const TOAST_DURATION_MS = 3500;

const ICONS = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    info: 'fa-circle-info',
};

const Toaster = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => subscribeToToasts((entry) => {
        setToasts(current => [...current, entry]);
        setTimeout(() => {
            setToasts(current => current.filter(item => item.id !== entry.id));
        }, TOAST_DURATION_MS);
    }), []);

    return (
        <div className="toaster" role="status" aria-live="polite">
            {toasts.map(entry => (
                <div key={entry.id} className={`toast toast-${entry.type}`}>
                    <i className={`fa-solid ${ICONS[entry.type] ?? ICONS.info}`} aria-hidden="true"></i>
                    <span>{entry.message}</span>
                </div>
            ))}
        </div>
    );
};

export default Toaster;
