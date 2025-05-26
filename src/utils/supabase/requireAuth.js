/// FILE — src/utils/supabase/requireAuth.js
/// PURPOSE — Provides a utility function to enforce authentication for server-side contexts using Supabase. Handles session validation, token refresh, and redirects or error responses based on authentication state. Ensures only authenticated users can proceed, and manages session restoration or redirection as needed.

// Instantiates a Supabase client using the request and response objects
import { ServerClient } from './server'; 

export async function requireAuth(context) {
  // Extracts request and response from the context for authentication operations
  const { req, res } = context;
  const supabase = ServerClient(req, res);
  const accessToken = req.cookies['sb-ezqxowoktggxkbdhnxik-auth-token'];
  const refreshToken = req.cookies['sb-refresh-token'];

  // Attempts to retrieve the current authenticated user
  const { data: existingUserData, error: existingUserError } = await supabase.auth.getUser();

  // Attempts to retrieve the current session
  const { data: existingSessionData, error: existingSessionError } = await supabase.auth.getSession();

  // Returns an error if session retrieval fails
  if (existingSessionError)return { props: { error: existingSessionError.message } };
  
  // If a valid session exists, returns the session if user data is present, otherwise returns an error
  if (existingSessionData.session) {
    if (existingUserData) return existingSessionData.session; 
    else    return {  props: {  error: "User is not Valid, Session may be faulty" }, };
  }
  
  // ——— REFRESH SESSION LOGIC ——————————————
  // Attempts to refresh the session if a refresh token is present but no access token
  if (refreshToken && !accessToken ) {
    const { refreshData, refreshError } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    // Redirects to login if refresh fails or no data is returned
    if (refreshError || !refreshData) return {
      redirect: {
        destination: '/api/auth/login',
        permanent: false,
      },
    };
    const { access_token: newAccessToken, refresh_token: newRefreshToken } = refreshData.session;

    // Sets the new session using the refreshed tokens
    const { error: setNewSessionError } = await supabase.auth.setSession({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      });
      if (setNewSessionError) return { props: { error: setNewSessionError.message, }, };
      
      // Returns the refreshed session
      return {
        user: refreshData.session,
      };
  }

  // Redirects to the home page if either token is missing
  if (!accessToken || !refreshToken) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Sets the session using the provided access and refresh tokens
  const { error: setSessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  // Returns an error if setting the session fails
  if (setSessionError) return {  props: {  error: setSessionError.message, }, };

  // Retrieves the session after setting it
  const { data: getSessionData, error: getSessionError } = await supabase.auth.getSession();
  if (getSessionError)   return {  props: {  error: getSessionError.message, }, };

  // Returns the authenticated session
  const session = getSessionData.session;
  return session;

}
