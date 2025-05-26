import { ServerClient } from '../../../utils/supabase/server';

export default async function handler(req, res) {
  try {
    const supabase = ServerClient(req, res);

    const redirectToUrl = process.env.NODE_ENV === 'production'
      ? process.env.REDIRECT_URL
      : 'http://localhost:3000/api/auth/callback';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectToUrl,
      },
    });

    if (error) {
      console.error('Supabase OAuth error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log('Redirecting To:', data.url);
    return res.redirect(302, data.url);
  } catch (error) {
    console.error('Error during OAuth login:', error.message);
    return res.status(500).json({ error: error.message });
  }
}