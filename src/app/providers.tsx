'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDevMockSession } from '@/lib/auth/client';

// Define unified Session interface
interface AuthUser {
  email: string;
  name: string;
  image?: string | null;
  role: 'student' | 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loginDemo: (role: 'student' | 'admin', email: string) => Promise<void>;
  logout: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpEmail: (email: string, password: string, name: string, rollNumber?: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginDemo: async () => {},
  logout: async () => {},
  signInEmail: async () => ({}),
  signUpEmail: async (email: string, password: string, name: string, rollNumber?: string) => ({}),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load active session from local cookies/localstorage on mount
  useEffect(() => {
    async function loadSession() {
      try {
        // First check Dev Mock Session
        const devSession = getDevMockSession();
        if (devSession) {
          setUser(devSession.user as AuthUser);
          setLoading(false);
          return;
        }

        // Fetch server session status via simple custom API check if needed,
        // or let the client load naturally
        const res = await fetch('/api/auth/session-check?t=' + Date.now(), { cache: 'no-store' }).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error("Failed to load session:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  const loginDemo = async (role: 'student' | 'admin', email: string) => {
    setLoading(true);
    // Write mock data to localStorage and cookies (so server can parse it too)
    window.localStorage.setItem('dev_mock_role', role);
    window.localStorage.setItem('dev_mock_email', email);
    
    // Set cookies for Server Actions & API Route fallbacks
    document.cookie = `dev_mock_email=${encodeURIComponent(email)}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `dev_mock_role=${encodeURIComponent(role)}; path=/; max-age=86400; SameSite=Lax`;

    setUser({
      email,
      name: role === 'admin' ? 'Demo AIML Administrator' : 'Demo Student Account',
      role
    });
    setLoading(false);

    // Redirect to correct dashboard
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/student');
    }
  };

  const signInEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { authClient } = await import('@/lib/auth/client');
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return { error: error.message || 'Invalid email or password.' };
      }

      // Load session
      const res = await fetch('/api/auth/session-check?t=' + Date.now(), { cache: 'no-store' }).catch(() => null);
      if (res && res.ok) {
        const sessionData = await res.json();
        if (sessionData.user) {
          setUser(sessionData.user);
          setLoading(false);
          if (sessionData.user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/student');
          }
          return {};
        }
      }
      
      setLoading(false);
      return { error: 'Failed to verify session after login.' };
    } catch (err: any) {
      setLoading(false);
      return { error: err.message || 'An unexpected error occurred.' };
    }
  };

  const signUpEmail = async (email: string, password: string, name: string, rollNumber?: string) => {
    setLoading(true);
    try {
      const { authClient } = await import('@/lib/auth/client');
      const { error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) {
        setLoading(false);
        return { error: error.message || 'Failed to create account.' };
      }

      // Pre-create student submission record so that the roll number is immediately saved
      if (rollNumber) {
        try {
          await fetch('/api/student/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              full_name: name,
              roll_number: rollNumber,
              stream: 'CSE-AIML',
              details: {
                stream: 'CSE-AIML',
                roll_number: rollNumber,
                full_name: name,
              }
            })
          });
        } catch (dbErr) {
          console.error("Failed to pre-create student record during signup:", dbErr);
        }
      }

      // Load session
      const res = await fetch('/api/auth/session-check?t=' + Date.now(), { cache: 'no-store' }).catch(() => null);
      if (res && res.ok) {
        const sessionData = await res.json();
        if (sessionData.user) {
          setUser(sessionData.user);
          setLoading(false);
          if (sessionData.user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/student');
          }
          return {};
        }
      }
      
      setLoading(false);
      return {};
    } catch (err: any) {
      setLoading(false);
      return { error: err.message || 'An unexpected error occurred.' };
    }
  };

  const logout = async () => {
    setLoading(true);
    // Clear mock cookies/storage
    window.localStorage.removeItem('dev_mock_role');
    window.localStorage.removeItem('dev_mock_email');
    document.cookie = 'dev_mock_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'dev_mock_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Clear live session if active
    try {
      const { authClient } = await import('@/lib/auth/client');
      if (authClient) {
        await authClient.signOut();
      }
    } catch {}

    setUser(null);
    setLoading(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginDemo, logout, signInEmail, signUpEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
