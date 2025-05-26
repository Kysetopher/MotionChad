import { setCookie } from 'nookies';
import { ServerClient } from '../../../utils/supabase/server';

export default async function handler(req, res) {
  try {
    const { code } = req.query;
    
    if (!code) {
      console.error("Authorization code is missing");
      return res.status(400).send("Authorization code is missing");
    }

    const supabase = ServerClient(req, res);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error, data);
      throw error;
    }

    const { session } = data;
    if (!session || !session.access_token || !session.refresh_token) {
      console.error('Invalid session data');
      throw new Error('Invalid session data');
    }

    const { error: setSessionError } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    if (setSessionError){
      console.error('Error setting session:', setSessionError, data);
      throw new Error(setSessionError.message);
    };

    console.log('OAuth flow complete, redirecting...');

    res.redirect('/agent');
  } catch (error) {
    console.error('Error during OAuth redirect handling:', error);
    res.status(500).send(`Error during OAuth redirect handling: ${error.message}`);
  }
}