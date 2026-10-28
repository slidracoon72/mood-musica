import { describe, expect, it } from 'vitest';
import { createEmotionTracker } from './emotionTracker';

const FRAME_MS = 150; // detection interval plus inference time
const NEUTRAL = { neutral: 0, happy: 0, sad: 0, angry: 0, fearful: 0, disgusted: 0, surprised: 0 };
const face = (probabilities) => ({ ...NEUTRAL, ...probabilities });

// Feeds frames at FRAME_MS intervals; returns the first locked reading and when it happened
const run = (frames, options) => {
  const tracker = createEmotionTracker(options);
  for (let i = 0; i < frames.length; i++) {
    const reading = tracker.update(frames[i], i * FRAME_MS);
    if (reading.locked) return { emotion: reading.emotion, at: i * FRAME_MS };
  }
  return null;
};

const repeat = (count, frameAt) => Array.from({ length: count }, (_, i) => frameAt(i));

describe('createEmotionTracker', () => {
  it('locks in a clear expression after the hold time', () => {
    const result = run(repeat(30, () => face({ happy: 0.95, neutral: 0.05 })));
    expect(result).toEqual({ emotion: 'happy', at: 2100 });
  });

  it('does not lock in before the hold time', () => {
    const result = run(repeat(13, () => face({ happy: 0.95 }))); // last frame at 1800ms
    expect(result).toBeNull();
  });

  it('respects a custom hold time', () => {
    const result = run(repeat(30, () => face({ sad: 0.9 })), { holdMs: 1000 });
    expect(result).toEqual({ emotion: 'sad', at: 1050 });
  });

  it('ignores occasional noisy frames', () => {
    // A per-frame top label would flip to neutral every 6th frame and never lock
    const frames = repeat(30, (i) => (i % 6 === 5 ? face({ neutral: 0.6, sad: 0.4 }) : face({ sad: 0.85, neutral: 0.15 })));
    expect(run(frames)).toEqual({ emotion: 'sad', at: 2100 });
  });

  it('settles on the consistent leader of a near-tie', () => {
    // Like real faces scoring sad 0.47 vs happy 0.41, with frame-to-frame jitter
    const frames = repeat(40, (i) => {
      const sad = 0.47 + (i % 2 === 0 ? 0.06 : -0.06);
      return face({ sad, happy: 0.88 - sad, neutral: 0.12 });
    });
    expect(run(frames)?.emotion).toBe('sad');
  });

  it('never locks in when no emotion is confident', () => {
    const frames = repeat(60, () => face({ neutral: 0.36, happy: 0.32, sad: 0.32 }));
    expect(run(frames)).toBeNull();
  });

  it('tolerates brief face loss such as blinks', () => {
    const frames = repeat(30, (i) => (i % 8 === 7 ? null : face({ happy: 0.9, neutral: 0.1 })));
    expect(run(frames)).toEqual({ emotion: 'happy', at: 2100 });
  });

  it('resets after the face is gone longer than the grace period', () => {
    const tracker = createEmotionTracker();
    tracker.update(face({ happy: 0.9 }), 0);
    tracker.update(face({ happy: 0.9 }), 1500);
    tracker.update(null, 1600);
    const afterLoss = tracker.update(null, 2400); // 900ms without a face

    expect(afterLoss).toMatchObject({ faceVisible: false, emotion: null, locked: false });

    const back = tracker.update(face({ happy: 0.9 }), 2500);
    expect(back.leaderSince).toBe(2500);
    expect(back.locked).toBe(false);
  });

  it('never locks in while no face is visible', () => {
    const tracker = createEmotionTracker({ faceLossGraceMs: 5000 });
    tracker.update(face({ happy: 0.9 }), 0);
    expect(tracker.update(null, 3000).locked).toBe(false);
  });

  it('restarts the timer when a different emotion takes the lead', () => {
    const frames = [
      ...repeat(10, () => face({ happy: 0.95 })), // 0 - 1350ms
      ...repeat(30, () => face({ surprised: 0.95 })),
    ];
    const result = run(frames);
    expect(result.emotion).toBe('surprised');
    expect(result.at).toBeGreaterThanOrEqual(1500 + 2000);
  });

  it('reports the current reading while scanning', () => {
    const tracker = createEmotionTracker();
    expect(tracker.update(null, 0)).toMatchObject({ faceVisible: false, emotion: null, locked: false });
    expect(tracker.update(face({ neutral: 0.34, happy: 0.33, sad: 0.33 }), 100))
      .toMatchObject({ faceVisible: true, emotion: null, locked: false });
    // Smoothing means one confident frame is not enough to take the lead
    expect(tracker.update(face({ angry: 0.9 }), 200)).toMatchObject({ faceVisible: true, emotion: null });
    expect(tracker.update(face({ angry: 0.9 }), 300)).toMatchObject({ faceVisible: true, emotion: 'angry', leaderSince: 300 });
  });
});
