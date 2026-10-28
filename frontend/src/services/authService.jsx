import { useEffect, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from './toastService';

// Returns the signed-in Firebase user (or null) and whether auth is still initializing
export const useAuthUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setLoading(false);
  }), []);

  return { user, loading };
};

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
