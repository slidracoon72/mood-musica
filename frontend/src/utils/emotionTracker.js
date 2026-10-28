// Turns noisy per-frame expression probabilities into a stable mood reading.
//
// The expression model often returns near-ties (e.g. sad 0.47 / happy 0.41),
// so taking each frame's top label makes the reading flicker and restart.
// Instead, probabilities are smoothed over time, an emotion must reach a
// minimum smoothed confidence to count, and it must stay the leader for
// `holdMs` before it locks in. Brief face loss (blinks, head turns) is ignored.
export const createEmotionTracker = ({
  smoothing = 0.35,       // weight of the newest frame in the moving average
  minConfidence = 0.4,    // smoothed probability needed to count as the leader
  holdMs = 2000,          // how long the leader must hold to lock in
  faceLossGraceMs = 600,  // how long the face may disappear before resetting
} = {}) => {
  let smoothed = null;
  let leader = null;
  let leaderSince = 0;
  let lastFaceAt = -Infinity;

  const reading = (faceVisible, now) => ({
    faceVisible,
    emotion: leader,
    leaderSince,
    locked: faceVisible && leader !== null && now - leaderSince >= holdMs,
  });

  // `expressions` is the model output ({ happy: 0.9, ... }) or null when no face is visible
  const update = (expressions, now) => {
    if (!expressions) {
      if (now - lastFaceAt > faceLossGraceMs) {
        smoothed = null;
        leader = null;
      }
      return reading(false, now);
    }

    lastFaceAt = now;
    smoothed = smoothed
      ? Object.fromEntries(Object.entries(expressions).map(
        ([emotion, probability]) => [emotion, smoothing * probability + (1 - smoothing) * (smoothed[emotion] ?? 0)]
      ))
      : { ...expressions };

    const [topEmotion, topScore] = Object.entries(smoothed)
      .reduce((best, current) => (current[1] > best[1] ? current : best));
    const candidate = topScore >= minConfidence ? topEmotion : null;

    if (candidate !== leader) {
      leader = candidate;
      leaderSince = now;
    }
    return reading(true, now);
  };

  return { update };
};
