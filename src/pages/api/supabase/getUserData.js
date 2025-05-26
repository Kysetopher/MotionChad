import { ServerClient, validateUser } from '../../../utils/supabase/server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    const supabase = ServerClient(req, res);

    // Get the user information from the session
    const { user, autherror } = await validateUser(supabase, res);


    if (!user || autherror) {
      console.error('Authentication error:', autherror);
      return res.status(401).json({ error: 'User not authenticated.' });
    }


    const userId = user.id;

    // Query the database for the specified userId
    const { data: userData, error: userDataError } = await supabase
      .from('user')
      .select(`
        id,
        name,
        core_values,
        communication_style,
        short_term_goals,
        long_term_goals
      `)
      .eq('id', userId)
      .single();

    if (userDataError) {
      console.error('Error querying database:', userDataError);
      return res.status(500).json({ error: 'Error querying database.' });
    }

    // Send the combined data back to the client
    res.status(200).json({
      id: userData.id,
      name: userData.name,
      core_values: userData.core_values,
      communication_style: userData.communication_style,
      short_term_goals: userData.short_term_goals,
      long_term_goals: userData.long_term_goals,
      email: user.email,
      phone: user.phone,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
    });
  } catch (error) {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: error.message });
  }
}