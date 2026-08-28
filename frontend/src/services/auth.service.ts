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
    let authUser: any = null;
    let authSession: any = null;

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
      // If user already exists in auth.users (e.g. deleted only from public.users table),
      // sign in to link and restore the public.users profile
      if (
        authError.message.toLowerCase().includes('already registered') ||
        authError.message.toLowerCase().includes('already exists') ||
        authError.status === 422
      ) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: password,
        });

        if (signInError || !signInData.user) {
          throw new Error('An account with this email exists in authentication. Please use your existing password or reset it.');
        }

        authUser = signInData.user;
        authSession = signInData.session;
      } else {
        throw new Error(formatAuthError(authError));
      }
    } else {
      authUser = authData.user;
      authSession = authData.session;
    }

    if (!authUser) {
      throw new Error('Registration failed. Unable to create user account.');
    }

    const userId = authUser.id;

    // 2. Insert fresh profile record into public.users
    try {
      const { error: profileError } = await supabase
        .from('users')
        .upsert(
          [
            {
              id: userId,
              name: trimmedName,
              email: trimmedEmail,
              onboarding_completed: false,
            },
          ],
          { onConflict: 'id' }
        );

      if (profileError) {
        console.warn('Profile insertion notice (handled by DB trigger or RLS):', profileError.message);
      }

      // Clear any prior stale onboarding profile row for this user
      await supabase.from('profiles').delete().eq('user_id', userId);
    } catch (err) {
      console.warn('Direct profile insert error:', err);
    }

    const user: User = {
      id: userId,
      name: trimmedName,
      email: trimmedEmail,
      role: 'Learner',
      avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(trimmedEmail)}`,
      createdAt: authUser.created_at || new Date().toISOString(),
      onboardingCompleted: false,
    };

    localStorage.setItem('pathai_user', JSON.stringify(user));
    return { user, session: authSession };
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
      const err = new Error(formatAuthError(authError));
      (err as any).code = 'USER_NOT_FOUND';
      throw err;
    }

    if (!authData.user) {
      throw new Error('Login failed. No authenticated session was found.');
    }

    const userId = authData.user.id;

    // 2. Load profile from public.users table
    const { data: profileRow } = await supabase
      .from('users')
      .select('id, name, email, onboarding_completed, created_at')
      .eq('id', userId)
      .maybeSingle();

    // If profile row does NOT exist in public.users (e.g. deleted from users table),
    // do not auto-create: log out and throw USER_NOT_FOUND so frontend redirects to register
    if (!profileRow) {
      await supabase.auth.signOut();
      localStorage.removeItem('pathai_user');
      localStorage.removeItem('pathai_access_token');
      localStorage.removeItem('pathai_refresh_token');

      const notFoundErr = new Error('No user account found. Please create an account.');
      (notFoundErr as any).code = 'USER_NOT_FOUND';
      throw notFoundErr;
    }

    // 3. Also check public.profiles table if user completed onboarding
    const { data: onboardingProfileRow } = await supabase
      .from('profiles')
      .select('onboarding_completed, profile_metadata')
      .eq('user_id', userId)
      .maybeSingle();

    const isCompleted = Boolean(
      profileRow.onboarding_completed || onboardingProfileRow?.onboarding_completed
    );

    const user: User = {
      id: userId,
      name: profileRow.name || authData.user.user_metadata?.name || trimmedEmail.split('@')[0],
      email: profileRow.email || authData.user.email || trimmedEmail,
      role: 'Learner',
      avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(trimmedEmail)}`,
      createdAt: profileRow.created_at || authData.user.created_at || new Date().toISOString(),
      onboardingCompleted: isCompleted,
      profile: (onboardingProfileRow?.profile_metadata as UserProfile) || undefined,
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
      const { data: profileRow } = await supabase
        .from('users')
        .select('id, name, email, onboarding_completed, created_at')
        .eq('id', userId)
        .maybeSingle();

      // If user was missing from public.users, auto-recreate instead of signing out
      let finalProfileRow = profileRow;
      if (!profileRow) {
        console.warn('Profile row missing in public.users. Auto-recreating...');
        const { data: newRow, error: insertError } = await supabase
          .from('users')
          .upsert(
            [
              {
                id: userId,
                name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Learner',
                email: authUser.email,
                onboarding_completed: false,
              },
            ],
            { onConflict: 'id' }
          )
          .select('id, name, email, onboarding_completed, created_at')
          .maybeSingle();
          
        if (insertError) {
          console.error('Failed to auto-recreate profile row:', insertError);
        } else {
          finalProfileRow = newRow;
        }
      }

      // Check public.profiles table
      const { data: onboardingProfileRow } = await supabase
        .from('profiles')
        .select('onboarding_completed, profile_metadata')
        .eq('user_id', userId)
        .maybeSingle();

      const isCompleted = Boolean(
        finalProfileRow?.onboarding_completed || onboardingProfileRow?.onboarding_completed
      );

      const user: User = {
        id: userId,
        name: finalProfileRow?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Learner',
        email: finalProfileRow?.email || authUser.email || '',
        role: 'Learner',
        avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(authUser.email || userId)}`,
        createdAt: finalProfileRow?.created_at || authUser.created_at,
        onboardingCompleted: isCompleted,
        profile: (onboardingProfileRow?.profile_metadata as UserProfile) || undefined,
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

    try {
      if (currentUser?.id) {
        await supabase
          .from('users')
          .update({ onboarding_completed: true })
          .eq('id', currentUser.id);
      }
    } catch (e) {
      console.warn('Failed to update onboarding_completed in users table:', e);
    }

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
