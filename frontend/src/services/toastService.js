// Minimal pub/sub so any module can show a toast rendered by <Toaster />
const listeners = new Set();
let nextId = 1;

export const toast = (message, type = 'info') => {
  const entry = { id: nextId++, message, type };
  listeners.forEach((listener) => listener(entry));
};

export const subscribeToToasts = (listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
