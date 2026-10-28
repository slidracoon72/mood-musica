import { MOODS, MOOD_KEYS } from '../moods';

const MoodPicker = ({ activeMood, onPick, disabled }) => (
    <div className="mood-picker" role="group" aria-label="Pick a mood">
        {MOOD_KEYS.map(key => (
            <button
                key={key}
                type="button"
                className={`mood-option ${activeMood === key ? 'is-active' : ''}`}
                style={{ '--mood': MOODS[key].color }}
                aria-pressed={activeMood === key}
                disabled={disabled}
                onClick={() => onPick(key)}
            >
                <i className={`fa-solid ${MOODS[key].icon}`} aria-hidden="true"></i>
                {MOODS[key].label}
            </button>
        ))}
    </div>
);

export default MoodPicker;
