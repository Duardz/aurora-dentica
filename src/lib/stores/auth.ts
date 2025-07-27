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
    console.log('🔍 Auth state changed:', {
      user: user ? {
        email: user.email,
        emailVerified: user.emailVerified,
        uid: user.uid
      } : null
    });

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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    console.log('✅ Login successful:', {
      email: userCredential.user.email,
      emailVerified: userCredential.user.emailVerified,
      uid: userCredential.user.uid
    });

    // Wait a moment for auth state to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error: any) {
    console.error('❌ Login error:', error);
    
    let errorMessage = 'Sign in failed';
    
    // Handle specific error codes
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/user-disabled':
        errorMessage = 'User account is disabled';
        break;
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Invalid email or password';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection.';
        break;
      default:
        // Don't show the raw error to users for security
        errorMessage = 'Login failed. Please try again.';
        break;
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
    console.log('✅ Signed out successfully');
  } catch (error) {
    console.error('❌ Sign out error:', error);
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

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  let currentUser = null;
  authStore.subscribe(state => {
    currentUser = state.user;
  })();
  return currentUser;
}