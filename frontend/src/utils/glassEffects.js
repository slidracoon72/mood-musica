import { MOODS } from '../moods';

// Glass controls that light up from the pointer, like Liquid Glass glowing
// from under a fingertip (see the ::after rules in styles.css)
const INTERACTIVE_GLASS = '.glass-interactive, .btn-primary, .btn-secondary, .mood-option, .nav-toggle';

const DEFAULT_AMBIENT = '#8b5cf6';

export const enableGlassPointerGlow = () => {
  const track = (event) => {
    const element = event.target instanceof Element ? event.target.closest(INTERACTIVE_GLASS) : null;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty('--glow-x', `${event.clientX - rect.left}px`);
    element.style.setProperty('--glow-y', `${event.clientY - rect.top}px`);
  };
  window.addEventListener('pointermove', track, { passive: true });
  window.addEventListener('pointerdown', track, { passive: true });
};

// Tints the app's ambient background with a mood's colour (null resets it).
// Colour lives in the content layer and shows through the glass above it.
export const setAmbientMood = (emotion) => {
  document.documentElement.style.setProperty('--ambient', MOODS[emotion]?.color ?? DEFAULT_AMBIENT);
};
