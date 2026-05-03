import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, firebaseConfigError } from '../lib/firebase';
import { api } from '../lib/api';

const DEMO_USER_STORAGE_KEY = 'metaflow.demo-user';

interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  provider: 'firebase' | 'demo';
}

interface AuthContextType {
  user: AppUser | null;
  token: string | null;
  loading: boolean;
  isDemoMode: boolean;
  authMessage: string | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  continueAsDemo: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function mapFirebaseUser(user: FirebaseUser): AppUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
    provider: 'firebase',
  };
}

function createDemoUser(name = 'Guest', email = 'demo@meterflow.local'): AppUser {
  return {
    uid: 'demo-user',
    email,
    displayName: name,
    emailVerified: true,
    provider: 'demo',
  };
}

function readStoredDemoUser(): AppUser | null {
  if (typeof window === 'undefined') return null;
  const rawValue = window.localStorage.getItem(DEMO_USER_STORAGE_KEY);
  if (!rawValue) return null;
  try {
    const parsed = JSON.parse(rawValue) as AppUser;
    return parsed?.provider === 'demo' ? parsed : null;
  } catch {
    window.localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    return null;
  }
}

function persistDemoUser(user: AppUser | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    window.localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(DEMO_USER_STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isDemoMode = !auth;
  const authMessage = isDemoMode
    ? firebaseConfigError ?? 'Firebase auth is not configured yet, so the app is running in demo mode.'
    : null;

  useEffect(() => {
    if (!auth) {
      const storedDemoUser = readStoredDemoUser();
      if (storedDemoUser) {
        setUser(storedDemoUser);
        setToken('demo-token');
      }
      setLoading(false);
      return;
    }

    if (readStoredDemoUser()) {
      persistDemoUser(null);
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        try {
          if (currentUser) {
            // Force reload to get latest emailVerified status
            await currentUser.reload();
            const freshUser = auth.currentUser || currentUser;
            setUser(mapFirebaseUser(freshUser));
            const idToken = await freshUser.getIdToken();
            setToken(idToken);
          } else {
            setUser(null);
            setToken(null);
          }
        } catch (error) {
          console.error('Failed to resolve auth state:', error);
          setUser(null);
          setToken(null);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Firebase auth listener failed:', error);
        setUser(null);
        setToken(null);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    if (!auth) {
      const demoUser = createDemoUser('Guest', email || 'demo@meterflow.local');
      persistDemoUser(demoUser);
      setUser(demoUser);
      setToken('demo-token');
      return;
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;

    // REQUIREMENT 3: Block login if not verified
    if (!firebaseUser.emailVerified) {
      await signOut(auth);
      throw new Error('Please verify your email before logging in.');
    }

    const idToken = await firebaseUser.getIdToken();
    try {
      await api.post('/users/sync', {}, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
    } catch (error) {
      console.error('Sync failed during login:', error);
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    if (!auth) {
      const demoUser = createDemoUser(name, email || 'demo@meterflow.local');
      persistDemoUser(demoUser);
      setUser(demoUser);
      setToken('demo-token');
      return;
    }

    // REQUIREMENT 1: Signup Flow
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;

    // Send verification email
    await sendEmailVerification(firebaseUser);
    
    // Update profile
    await updateProfile(firebaseUser, { displayName: name });

    // Sync with backend
    const idToken = await firebaseUser.getIdToken();
    try {
      await api.post('/users/sync', {}, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
    } catch (error) {
      console.error('Sync failed during signup:', error);
    }
  };

  const continueAsDemo = async () => {
    const demoUser = createDemoUser();
    persistDemoUser(demoUser);
    setUser(demoUser);
    setToken('demo-token');
  };

  const logout = async () => {
    if (!auth) {
      persistDemoUser(null);
      setUser(null);
      setToken(null);
      return;
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isDemoMode, authMessage, login, signup, continueAsDemo, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
