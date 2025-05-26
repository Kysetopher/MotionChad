import { ServerClient,  validateUser } from '../../../utils/supabase/server';
import { getTileIdsByCardId } from '../../../utils/supabase/functions';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = ServerClient(req, res);
    const { user, autherror } = await validateUser(supabase, res);

    if (!user || autherror) {
        console.error('Authentication error:', autherror);
        return res.status(401).json({ error: 'User not authenticated.' });
    }
    const { cardId } = req.query;
    const result = await getTileIdsByCardId(supabase, cardId);
    res.status(200).json({ tileIds: result.data.map(item => item.tileresponse_id) });

  } catch (error) {
    console.error('Error getting tile IDs by card ID:', error);
    res.status(500).json({ error: error.message });
  }
}