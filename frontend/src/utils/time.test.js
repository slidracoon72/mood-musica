import { describe, expect, it } from 'vitest';
import { formatDuration, relativeTime } from './time';

const NOW = Date.UTC(2026, 9, 28, 12, 0, 0);
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('relativeTime', () => {
  it.each([
    [NOW - 10 * 1000, 'just now'],
    [NOW - 5 * MINUTE, '5 minutes ago'],
    [NOW - 3 * HOUR, '3 hours ago'],
    [NOW - DAY, 'yesterday'],
    [NOW - 3 * DAY, '3 days ago'],
    [NOW - 14 * DAY, '2 weeks ago'],
    [NOW - 400 * DAY, 'last year'],
  ])('formats %s', (timestamp, expected) => {
    expect(relativeTime(timestamp, NOW)).toBe(expected);
  });

  it('returns an empty string without a timestamp', () => {
    expect(relativeTime(undefined, NOW)).toBe('');
    expect(relativeTime(0, NOW)).toBe('');
  });
});

describe('formatDuration', () => {
  it.each([
    [0, '0:00'],
    [5.9, '0:05'],
    [30, '0:30'],
    [75, '1:15'],
    [NaN, '0:00'],
    [-3, '0:00'],
  ])('formats %s seconds', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });
});
