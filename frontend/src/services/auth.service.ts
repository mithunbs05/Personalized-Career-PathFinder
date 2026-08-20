import { supabase, formatAuthError } from '../lib/supabase';
import { LoginCredentials, RegisterCredentials, User, UserProfile } from '../types/auth';

export const authService = {
  /**
   * Register a new user using Supabase Auth and insert profile into public.users.
   */
  async register(credentials: RegisterCredentials): Promise<{ user: User; session: any }> {
    const trimmedName = credentials.name.trim();
    const trimmedEmail = credentials.email.trim().toLowerCase();
    const password = credentials.password || '';

    // 1. Sign up with Supabase Auth (metadata stored in raw_user_meta_data)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: password,
      options: {
        data: {
          name: trimmedName,
        },
      },
    });

    if (authError) {
      throw new Error(formatAuthError(authError));
    }

    if (!authData.user) {
      throw new Error('Registration failed. Unable to create user account.');
    }

    const userId = authData.user.id;

    // 2. Insert profile record into public.users
    try {
      const { error: profileError } = await supabase
        .from('users')
        .upsert(
          [
            {
              id: userId,
              name: trimmedName,
              email: trimmedEmail,
            },
          ],
          { onConflict: 'id' }
        );

      if (profileError) {
        console.warn('Profile insertion notice (handled by DB trigger or RLS):', profileError.message);
      }
    } catch (err) {
      console.warn('Direct profile insert error:', err);
    }

    const user: User = {
      id: userId,
      name: trimmedName,
      email: trimmedEmail,
      role: 'Learner',
      avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(trimmedEmail)}`,
      createdAt: authData.user.created_at || new Date().toISOString(),
      onboardingCompleted: false,
    };

    localStorage.setItem('pathai_user', JSON.stringify(user));
    return { user, session: authData.session };
  },

  /**
   * Sign in an existing user with Supabase Auth and load public.users profile.
   */
  async login(credentials: LoginCredentials): Promise<{ user: User }> {
    const trimmedEmail = credentials.email.trim().toLowerCase();
    const password = credentials.password || '';

    // 1. Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: password,
    });

    if (authError) {
      throw new Error(formatAuthError(authError));
    }

    if (!authData.user) {
      throw new Error('Login failed. No authenticated session was found.');
    }

    const userId = authData.user.id;

    // 2. Load profile from public.users table
    let { data: profileRow, error: profileError } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .eq('id', userId)
      .maybeSingle();

    // If profile row doesn't exist in public.users yet, create it now that we have an active session
    if (!profileRow) {
      const fallbackName =
        authData.user.user_metadata?.name ||
        authData.user.user_metadata?.full_name ||
        trimmedEmail.split('@')[0];

      const { data: newRow, error: insertError } = await supabase
        .from('users')
        .upsert(
          [
            {
              id: userId,
              name: fallbackName,
              email: trimmedEmail,
            },
          ],
          { onConflict: 'id' }
        )
        .select('id, name, email, created_at')
        .maybeSingle();

      if (!insertError && newRow) {
        profileRow = newRow;
      }
    }

    const storedUser = this.getStoredUser();

    const user: User = {
      id: userId,
      name: profileRow?.name || authData.user.user_metadata?.name || trimmedEmail.split('@')[0],
      email: profileRow?.email || authData.user.email || trimmedEmail,
      role: 'Learner',
      avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(trimmedEmail)}`,
      createdAt: profileRow?.created_at || authData.user.created_at || new Date().toISOString(),
      onboardingCompleted: storedUser?.id === userId ? (storedUser.onboardingCompleted ?? true) : true,
      profile: storedUser?.id === userId ? storedUser.profile : undefined,
    };

    localStorage.setItem('pathai_user', JSON.stringify(user));
    return { user };
  },

  /**
   * Sign out current user from Supabase and clear local state.
   */
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase sign out error:', err);
    } finally {
      localStorage.removeItem('pathai_user');
      localStorage.removeItem('pathai_access_token');
      localStorage.removeItem('pathai_refresh_token');
    }
  },

  /**
   * Get the currently authenticated Supabase user and profile.
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        return null;
      }

      const authUser = session.user;
      const userId = authUser.id;

      // Load profile from public.users
      let { data: profileRow } = await supabase
        .from('users')
        .select('id, name, email, created_at')
        .eq('id', userId)
        .maybeSingle();

      // If profile row doesn't exist in public.users yet, ensure it is created
      if (!profileRow) {
        const fallbackName =
          authUser.user_metadata?.name ||
          authUser.user_metadata?.full_name ||
          authUser.email?.split('@')[0] ||
          'Learner';

        const { data: newRow } = await supabase
          .from('users')
          .upsert(
            [
              {
                id: userId,
                name: fallbackName,
                email: authUser.email || '',
              },
            ],
            { onConflict: 'id' }
          )
          .select('id, name, email, created_at')
          .maybeSingle();

        if (newRow) {
          profileRow = newRow;
        }
      }

      const storedUser = this.getStoredUser();

      const user: User = {
        id: userId,
        name: profileRow?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Learner',
        email: profileRow?.email || authUser.email || '',
        role: 'Learner',
        avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(authUser.email || userId)}`,
        createdAt: profileRow?.created_at || authUser.created_at,
        onboardingCompleted: storedUser?.id === userId ? (storedUser.onboardingCompleted ?? true) : true,
        profile: storedUser?.id === userId ? storedUser.profile : undefined,
      };

      localStorage.setItem('pathai_user', JSON.stringify(user));
      return user;
    } catch (err) {
      console.warn('Error fetching current Supabase user:', err);
      return null;
    }
  },

  /**
   * Saves onboarding profile and marks onboarding completed.
   */
  async saveOnboardingProfile(profile: UserProfile): Promise<{ success: boolean; user: User; roadmap: any }> {
    const currentUser = await this.getCurrentUser();
    const updatedUser: User = {
      ...(currentUser || {
        id: 'user-' + Date.now(),
        name: 'Learner',
        email: 'user@pathai.dev',
      }),
      onboardingCompleted: true,
      profile,
    };

    localStorage.setItem('pathai_user', JSON.stringify(updatedUser));

    return {
      success: true,
      user: updatedUser,
      roadmap: null,
    };
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

  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },
};
