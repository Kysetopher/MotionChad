/// FILE — src/utils/supabase/forceLogin.js
/// PURPOSE — Provides a utility function to enforce user authentication in Next.js server-side contexts. If a user is authenticated, they are redirected to a specified destination; otherwise, the page is rendered as usual. Integrates with Supabase for session validation and is intended for use in server-side rendering scenarios where access control is required.

import { ServerClient, validateUser } from './server';

export async function forceLogin(context, destination = '/agent') {
  const { req, res } = context;
  const supabase = ServerClient(req, res);

  // Validate the current user's session using Supabase
  const { user, error } = await validateUser(supabase, res);

  // If the user is authenticated and no error occurred, redirect to the specified destination
  if (user && !error) {
    return {
      redirect: {
        destination,
        permanent: false,
      },
    };
  }

  // If the user is not authenticated, allow the page to render and provide empty props
  return {
    props: {},
  };
}
