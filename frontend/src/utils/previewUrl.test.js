import { describe, expect, it } from 'vitest';
import { isPreviewUrlFresh } from './previewUrl';

const NOW = 1_800_000_000_000;
const urlExpiringAt = (ms) =>
  `https://cdnt-preview.dzcdn.net/api/1/1/a/b.mp3?hdnea=exp=${Math.floor(ms / 1000)}~acl=/api/1/1/a/b.mp3*~hmac=abc`;

describe('isPreviewUrlFresh', () => {
  it('accepts a URL that expires well in the future', () => {
    expect(isPreviewUrlFresh(urlExpiringAt(NOW + 10 * 60 * 1000), NOW)).toBe(true);
  });

  it('rejects an expired URL', () => {
    expect(isPreviewUrlFresh(urlExpiringAt(NOW - 1000), NOW)).toBe(false);
  });

  it('rejects a URL about to expire, so playback does not cut out', () => {
    expect(isPreviewUrlFresh(urlExpiringAt(NOW + 30 * 1000), NOW)).toBe(false);
  });

  it('accepts a URL without an expiry', () => {
    expect(isPreviewUrlFresh('https://cdn.example/preview.mp3', NOW)).toBe(true);
  });

  it('rejects a missing URL', () => {
    expect(isPreviewUrlFresh(undefined, NOW)).toBe(false);
    expect(isPreviewUrlFresh('', NOW)).toBe(false);
  });
});
