import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * OAuth Callback Handler
 * Handles redirects from Google, DigiLocker, and other OAuth providers
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(
        `/dashboard/login?error=${encodeURIComponent(errorDescription || error)}`,
        requestUrl.origin
      )
    );
  }

  // Exchange code for session
  if (code) {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError);
      return NextResponse.redirect(
        new URL(
          `/dashboard/login?error=${encodeURIComponent('Authentication failed')}`,
          requestUrl.origin
        )
      );
    }

    if (data.session) {
      // Check if this is a new user or existing user
      const { data: existingDoctor } = await supabase
        .from('doctors')
        .select('id, status')
        .eq('user_id', data.session.user.id)
        .single();

      if (existingDoctor) {
        // Existing doctor - redirect to dashboard
        const response = NextResponse.redirect(
          new URL('/dashboard', requestUrl.origin)
        );

        // Store user info in cookies for client-side access
        response.cookies.set('userRole', 'doctor', { path: '/' });
        response.cookies.set('userEmail', data.session.user.email || '', { path: '/' });
        response.cookies.set('userId', data.session.user.id, { path: '/' });

        return response;
      } else {
        // New user - redirect to complete registration
        // They've authenticated with Google but need to complete doctor profile
        const response = NextResponse.redirect(
          new URL(
            `/dashboard/register?oauth=google&email=${encodeURIComponent(data.session.user.email || '')}`,
            requestUrl.origin
          )
        );

        return response;
      }
    }
  }

  // Fallback: redirect to login if something went wrong
  return NextResponse.redirect(new URL('/dashboard/login', requestUrl.origin));
}
