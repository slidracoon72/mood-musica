// Refresh preview URLs that expire within this margin
const EXPIRY_MARGIN_MS = 60 * 1000;

// Deezer preview URLs carry their expiry as "exp=<unix seconds>"; URLs without
// one are assumed not to expire
export const isPreviewUrlFresh = (url, now = Date.now()) => {
  if (!url) return false;
  const match = url.match(/exp=(\d+)/);
  return !match || Number(match[1]) * 1000 - now > EXPIRY_MARGIN_MS;
};
