import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginCredentials, RegisterCredentials, UserProfile } from '../types/auth';
import { authService } from '../services/auth.service';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  guestLogin: () => Promise<void>;
  logout: () => Promise<void>;
  saveOnboarding: (profile: UserProfile) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser());
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.warn('Failed to verify current Supabase session:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial session check
    refreshUser();

    // 2. Real-time auth state subscription
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      return response.user;
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<User> => {
    setLoading(true);
    try {
      const response = await authService.register(credentials);
      setUser(response.user);
      return response.user;
    } finally {
      setLoading(false);
    }
  };

  const guestLogin = async () => {
    setLoading(true);
    try {
      const response = await authService.login({
        email: 'alex@pathai.dev',
        password: 'password123',
      });
      setUser(response.user);
    } catch (err) {
      // If demo user is not present in Supabase, provide fallback guest profile
      const guestUser: User = {
        id: 'guest-demo-user',
        name: 'Guest Learner',
        email: 'guest@pathai.dev',
        role: 'Learner',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        onboardingCompleted: true,
      };
      localStorage.setItem('pathai_user', JSON.stringify(guestUser));
      setUser(guestUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const saveOnboarding = async (profile: UserProfile) => {
    const result = await authService.saveOnboardingProfile(profile);
    if (result.user) {
      setUser(result.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        guestLogin,
        logout,
        saveOnboarding,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
