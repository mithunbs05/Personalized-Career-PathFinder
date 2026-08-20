import { request } from './api';
import { AuthResponse, LoginCredentials, RegisterCredentials, User, UserProfile } from '../types/auth';

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (data.tokens) {
      localStorage.setItem('pathai_access_token', data.tokens.accessToken);
      localStorage.setItem('pathai_refresh_token', data.tokens.refreshToken);
      localStorage.setItem('pathai_user', JSON.stringify(data.user));
    }

    return data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (data.tokens) {
      localStorage.setItem('pathai_access_token', data.tokens.accessToken);
      localStorage.setItem('pathai_refresh_token', data.tokens.refreshToken);
      localStorage.setItem('pathai_user', JSON.stringify(data.user));
    }

    return data;
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout network call failed:', err);
    } finally {
      localStorage.removeItem('pathai_access_token');
      localStorage.removeItem('pathai_refresh_token');
      localStorage.removeItem('pathai_user');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('pathai_access_token');
    if (!token) return null;

    try {
      const data = await request<{ user: User }>('/auth/me');
      if (data.user) {
        localStorage.setItem('pathai_user', JSON.stringify(data.user));
        return data.user;
      }
      return null;
    } catch (err) {
      console.warn('Failed to get current user (token stale/cleared):', err);
      localStorage.removeItem('pathai_access_token');
      localStorage.removeItem('pathai_refresh_token');
      localStorage.removeItem('pathai_user');
      return null;
    }
  },

  async saveOnboardingProfile(profile: UserProfile): Promise<{ success: boolean; user: User; roadmap: any }> {
    const data = await request<{ success: boolean; user: User; roadmap: any }>('/onboarding/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });

    if (data.user) {
      localStorage.setItem('pathai_user', JSON.stringify(data.user));
    }

    return data;
  },

  getStoredUser(): User | null {
    const stored = localStorage.getItem('pathai_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('pathai_access_token');
  }
};
