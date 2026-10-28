import { useSyncExternalStore } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from './toastService';

// One shared auth listener, so components mounted later (e.g. on navigation)
// get the known user immediately instead of flashing a loading state
let authState = { user: null, loading: true };
const listeners = new Set();

onAuthStateChanged(auth, (user) => {
  authState = { user, loading: false };
  listeners.forEach((listener) => listener());
});

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Returns the signed-in Firebase user (or null) and whether auth is still initializing
export const useAuthUser = () => useSyncExternalStore(subscribe, () => authState);

export const signIn = async () => {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (error) {
    // Closing the popup is not an error worth reporting
    if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
      console.error('Sign-in failed:', error);
      toast('Sign-in failed. Please try again.', 'error');
    }
  }
};

export const logOut = () => signOut(auth);
