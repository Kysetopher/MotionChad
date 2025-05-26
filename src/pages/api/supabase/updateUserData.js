import { ServerClient,  validateUser } from '../../../utils/supabase/server';


export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed. Use PATCH.' });
  }

  try {
    const supabase = ServerClient(req, res);
    const { user, autherror } = await validateUser(supabase, res);

    if (!user || autherror) {
        console.error('Authentication error:', autherror);
        return res.status(401).json({ error: 'User not authenticated.' });
    }
    const userId = user.id;

    const updateData = req.body;

    const { data, error } = await supabase
      .from('user')
      .update(updateData)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error updating database:', error);
      return res.status(500).json({ error: 'Error updating database.' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: error.message });
  }
}