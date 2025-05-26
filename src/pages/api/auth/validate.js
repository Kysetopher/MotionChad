import { parseCookies, setCookie } from 'nookies';
import { ServerClient } from '../../../utils/supabase/server';

export default async function handler(req, res) {
  try {
    const cookies = parseCookies({ req });

    let accessToken = cookies['sb-ezqxowoktggxkbdhnxik-auth-token'];
    let refreshToken = cookies['sb-refresh-token'];

    const supabase = ServerClient(req, res);
    let session = null;

    if (accessToken && refreshToken) {
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (setSessionError) {
        console.error('Error setting session:', setSessionError);
      } else {
        const { data, error: getSessionError } = await supabase.auth.getSession();
        if (getSessionError) {
          console.error('Error fetching session:', getSessionError);
        } else {
          session = data.session;
        }
      }
    }

    if (!session && refreshToken) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (refreshError) {
        console.error('Error refreshing session:', refreshError);
        return res.status(401).json({ error: 'Unauthorized' });
      }
      session = refreshData.session;

      const isProduction = process.env.NODE_ENV === 'production';

      setCookie({ res }, 'sb-refresh-token', refreshData.session.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: isProduction, 
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'Strict',
      });

      console.log('Session refreshed and cookies updated.');
    }

    if (!session) {
      console.log('No valid session found.');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.log("refresh session");
    return res.status(200).json({ session });
  } catch (error) {
    console.error('Error during session fetching:', error);
    return res.status(500).json({ error: 'Error during session fetching' });
  }
}