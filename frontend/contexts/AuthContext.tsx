'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { setAuthToken, clearAuthToken } from '@/lib/auth';

interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  // Sync token to localStorage when session changes
  useEffect(() => {
    if (session?.accessToken) {
      setAuthToken(session.accessToken);
    } else if (status === 'unauthenticated') {
      clearAuthToken();
    }
  }, [session, status]);

  const value: AuthContextType = {
    user: session?.user
      ? {
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.username || '',
          name: session.user.name || undefined,
        }
      : null,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
