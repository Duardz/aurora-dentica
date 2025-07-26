import { writable, type Writable } from 'svelte/store';
import { auth } from '$lib/firebase/config';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { browser } from '$app/environment';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Create auth store
export const authStore: Writable<AuthState> = writable({
  user: null,
  loading: true,
  error: null
});

/**
 * Initialize authentication state listener
 */
export function initAuth() {
  if (!browser || !auth) return;

  onAuthStateChanged(auth, (user) => {
    authStore.update(state => ({
      ...state,
      user,
      loading: false,
      error: null
    }));
  });
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<boolean> {
  if (!auth) {
    authStore.update(state => ({ ...state, error: 'Firebase not initialized' }));
    return false;
  }

  authStore.update(state => ({ ...state, loading: true, error: null }));

  try {
    await signInWithEmailAndPassword(auth, email, password);
    return true;
  } catch (error: any) {
    let errorMessage = 'Sign in failed';
    
    if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'User account is disabled';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password';
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid email or password';
    }

    authStore.update(state => ({ 
      ...state, 
      loading: false, 
      error: errorMessage 
    }));
    return false;
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  if (!auth) return;

  try {
    await signOut(auth);
    authStore.update(state => ({ 
      ...state, 
      user: null, 
      error: null 
    }));
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  let authenticated = false;
  authStore.subscribe(state => {
    authenticated = !!state.user;
  })();
  return authenticated;
}