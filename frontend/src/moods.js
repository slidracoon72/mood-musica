// Display settings for each emotion detected by face-api
export const MOODS = {
  happy: {
    label: 'Happy',
    icon: 'fa-face-laugh-beam',
    color: '#facc15',
    headline: 'You look happy',
    blurb: 'Here is something upbeat to keep the good mood going.',
  },
  sad: {
    label: 'Sad',
    icon: 'fa-face-sad-tear',
    color: '#60a5fa',
    headline: 'Feeling a little down',
    blurb: 'Here is a comforting song for you.',
  },
  angry: {
    label: 'Angry',
    icon: 'fa-face-angry',
    color: '#f87171',
    headline: 'Feeling frustrated',
    blurb: 'Take a breath. Something calm to help you unwind.',
  },
  surprised: {
    label: 'Surprised',
    icon: 'fa-face-surprise',
    color: '#fb923c',
    headline: 'You look surprised',
    blurb: 'Keep the energy up with something exciting.',
  },
  neutral: {
    label: 'Neutral',
    icon: 'fa-face-meh',
    color: '#a1a1aa',
    headline: 'Feeling calm and steady',
    blurb: 'Something easygoing to match your vibe.',
  },
  fearful: {
    label: 'Fearful',
    icon: 'fa-face-grimace',
    color: '#c084fc',
    headline: 'Feeling uneasy',
    blurb: 'Soothing music to help you settle.',
  },
  disgusted: {
    label: 'Disgusted',
    icon: 'fa-face-rolling-eyes',
    color: '#4ade80',
    headline: 'Not loving the moment',
    blurb: 'A mood booster to turn things around.',
  },
};

export const MOOD_KEYS = Object.keys(MOODS);
