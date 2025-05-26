import { ServerClient,  validateUser } from '../../../utils/supabase/server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    const supabase = ServerClient(req, res);
    const { user, autherror } = await validateUser(supabase, res);

    if (!user || autherror) {
        console.error('Authentication error:', autherror);
        return res.status(401).json({ error: 'User not authenticated.' });
    }

    const { tileId } = req.query;
    
    if (!tileId) {
      res.status(400).json({ error: 'Missing tileId parameter' });
      return;
    }

    const { data, error } = await supabase
      .from('revcards_tileresponses')
      .select('revcard_id')
      .eq('tileresponse_id', tileId);

    if (error) throw error;

    if (data.length === 0) {
      res.status(200).json({ cardId: null });
    } else {
      res.status(200).json({ cardId: data[0].revcard_id });
    }
  } catch (error) {
    console.error('Error getting card ID by tile ID:', error);
    res.status(500).json({ error: error.message });
  }
}