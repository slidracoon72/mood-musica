const Spinner = ({ large = false, label = 'Loading' }) => (
    <span className={`spinner ${large ? 'spinner-lg' : ''}`} role="status" aria-label={label}></span>
);

export default Spinner;
