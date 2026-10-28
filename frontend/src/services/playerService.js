import { useSyncExternalStore } from 'react';
import { fetchPreviewUrl } from './songService';
import { toast } from './toastService';
import { isPreviewUrlFresh } from '../utils/previewUrl';

// One app-wide audio element, so playback continues across pages and only
// one preview plays at a time
const audio = new Audio();
audio.preload = 'auto';

let state = { song: null, playing: false, loading: false, currentTime: 0, duration: 0 };
const listeners = new Set();

const setState = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
};

audio.addEventListener('play', () => setState({ playing: true }));
audio.addEventListener('pause', () => setState({ playing: false }));
audio.addEventListener('ended', () => setState({ playing: false, currentTime: 0 }));
audio.addEventListener('timeupdate', () => setState({ currentTime: audio.currentTime }));
audio.addEventListener('loadedmetadata', () => setState({ duration: audio.duration || 0 }));

// Plays a song's preview, or toggles it if it is already the current song
export const playSong = async (song) => {
  if (state.song?.id === song.id) {
    togglePlayback();
    return;
  }

  audio.pause();
  setState({ song, loading: true, playing: false, currentTime: 0, duration: 0 });
  try {
    const url = isPreviewUrlFresh(song.preview_url) ? song.preview_url : await fetchPreviewUrl(song.id);
    if (state.song?.id !== song.id) return; // another song was picked meanwhile
    audio.src = url;
    await audio.play();
  } catch (error) {
    if (state.song?.id !== song.id) return;
    console.error('Failed to play preview:', error);
    setState({ song: null });
    toast(error.message || 'Could not play the preview', 'error');
  } finally {
    if (state.song?.id === song.id) setState({ loading: false });
  }
};

export const togglePlayback = () => {
  if (!state.song) return;
  if (audio.paused) {
    audio.play().catch(() => toast('Could not play the preview', 'error'));
  } else {
    audio.pause();
  }
};

export const seek = (time) => {
  audio.currentTime = time;
  setState({ currentTime: time });
};

export const stopPlayback = () => {
  audio.pause();
  audio.removeAttribute('src');
  setState({ song: null, playing: false, loading: false, currentTime: 0, duration: 0 });
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const usePlayer = () => useSyncExternalStore(subscribe, () => state);
