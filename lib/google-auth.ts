/**
 * Google OAuth Integration for Doctor Registration & Login
 *
 * Setup Steps:
 * 1. Go to Supabase Dashboard > Authentication > Providers
 * 2. Enable Google provider
 * 3. Get Client ID and Client Secret from Google Cloud Console:
 *    - https://console.cloud.google.com/apis/credentials
 *    - Create OAuth 2.0 Client ID
 *    - Add authorized redirect URIs:
 *      - https://YOUR_PROJECT.supabase.co/auth/v1/callback
 *      - http://localhost:3000/auth/callback (for development)
 * 4. Copy credentials to Supabase Google provider settings
 */

import { supabase } from './supabase';

/**
 * Initiate Google OAuth sign-in flow
 * Redirects to Google consent screen
 */
export async function signInWithGoogle(redirectTo?: string) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      // Request specific scopes
      scopes: 'email profile',
    },
  });

  if (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }

  return data;
}

/**
 * Sign up with Google and create doctor profile
 * Use this in the registration flow
 */
export async function signUpWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard/register?step=2&oauth=google`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Google sign-up error:', error);
    throw error;
  }

  return data;
}

/**
 * Get user info from Google OAuth token
 * Called after redirect from Google
 */
export async function getGoogleUserInfo() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  // User metadata contains Google profile info
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.user_metadata.full_name || session.user.user_metadata.name,
    picture: session.user.user_metadata.avatar_url || session.user.user_metadata.picture,
    provider: session.user.app_metadata.provider,
  };
}

/**
 * Check if user already has a doctor profile
 */
export async function checkExistingDoctorProfile(userId: string) {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned, which is expected for new users
    throw error;
  }

  return data;
}

/**
 * Link Google account to existing doctor profile
 * Use when doctor already has an account but wants to enable Google login
 */
export async function linkGoogleAccount() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard/profile?google_linked=true`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Error linking Google account:', error);
    throw error;
  }

  return data;
}
