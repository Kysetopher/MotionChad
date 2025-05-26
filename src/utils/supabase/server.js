/// FILE — src/utils/supabase/server.js
/// PURPOSE — Provides server-side utilities for integrating Supabase authentication with Next.js API routes or server-side logic. Handles creation of a Supabase client with custom cookie management for SSR, and includes user validation with session refresh logic to ensure authentication state is maintained securely and reliably.

import { createServerClient } from '@supabase/ssr';
import { parseCookies, setCookie } from 'nookies';

// Creates a Supabase client instance for server-side usage, wiring in custom cookie handlers for SSR environments.
export function ServerClient(req, res) {
  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
      cookies: {
        // Retrieves all cookies from the incoming request and formats them for Supabase.
        getAll: async () => {
          const cookies = parseCookies({ req });
          return Object.entries(cookies).map(([name, value]) => ({ name, value }));
        },
        // Sets all cookies on the outgoing response, applying secure and HTTP-only flags for security.
        setAll: async (cookiesToSet) => {
          cookiesToSet.forEach(cookie => {
            setCookie({ res }, cookie.name, cookie.value, {
              path: '/',
              maxAge: 60 * 10,
              secure: true,
              sameSite: 'Strict', 
              httpOnly: true, 
              ...cookie.options,
            });
          });
        },
      },
    }
  );
  return supabase;
}

// Validates the current user session using the provided Supabase client.
// If the session is invalid or expired, attempts to refresh the session and update cookies accordingly.
// Returns the user object and any error encountered during the process.
export async function validateUser(supabase, res) {
  try {
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    // If user retrieval fails or user is not present, attempt to refresh the session.
    if (getUserError || !user) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !refreshData?.session) {
        // Removed detailed logging of user and session for security
        return { user: null, error: refreshError || getUserError };
      }
      const { access_token, refresh_token } = refreshData.session;
      const isProduction = process.env.NODE_ENV === 'production';

      // Updates the Supabase session with new tokens after a successful refresh.
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: access_token,
        refresh_token: refresh_token,
      });

      // BUG — Throws a reference error if 'error' is undefined; should throw setSessionError instead.
      if (setSessionError){
        console.error('Error setting session:', setSessionError, data);
        throw error;
      };

      // Session refreshed successfully

      return { user: refreshData.session.user, error: null };
    }
    return { user, error: null };
  } catch (error) {
    console.error('validateAndRefreshUser error:', error);
    return { user: null, error };
  }
}