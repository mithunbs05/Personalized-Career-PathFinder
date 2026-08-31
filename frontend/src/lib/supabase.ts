import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anon Key is missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Maps raw Supabase Auth and PostgREST errors into clean, user-friendly messages.
 */
export function formatAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const message = (error.message || error.error_description || String(error)).toLowerCase();

  if (message.includes('user already registered') || message.includes('already registered') || message.includes('unique constraint') || message.includes('users_email_key')) {
    return 'An account with this email address already exists. Please sign in instead.';
  }
  if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
    return 'Invalid email or password. Please verify your details and try again.';
  }
  if (message.includes('email not confirmed')) {
    return 'Please check your inbox to confirm your email before signing in.';
  }
  if (message.includes('password should be at least') || message.includes('weak password')) {
    return 'Password must be at least 6 characters long.';
  }
  if (message.includes('invalid email') || message.includes('unable to validate email')) {
    return 'Please enter a valid email address.';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }

  return error.message || 'Authentication failed. Please try again.';
}
