const EmptyState = ({ icon, title, children, action }) => (
    <div className="panel empty-state">
        <span className="empty-icon"><i className={`fa-solid ${icon}`} aria-hidden="true"></i></span>
        <h2>{title}</h2>
        <p>{children}</p>
        {action}
    </div>
);

export default EmptyState;
