import { addTags } from '../../../utils/supabase/functions';
import { ServerClient,  validateUser } from '../../../utils/supabase/server';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = ServerClient(req, res);
    
    const { user, autherror } = await validateUser(supabase, res);

    if (!user || autherror) {
      console.error('Authentication error:', autherror);
      return res.status(401).json({ error: 'User not authenticated.' });
    }

    const { tagData } = req.body;

    const tagIds = await addTags(supabase, tagData);

    res.status(200).json({ tagIds });
  } catch (error) {
    console.error('Error inserting data into Supabase:', error);
    res.status(500).json({ error: error.message });
  }
}