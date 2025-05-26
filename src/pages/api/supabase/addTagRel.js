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


    const { tagId, revId } = req.body;

    if (!tagId || !revId) throw new Error('Invalid tileId or revId');

    const { data, error } = await supabase
        .from('revcards_cryptolex')
        .insert([{ revcard_id: revId, cryptolex_id: tagId }])
        .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("No data returned from insert operation");

    res.status(200).json(data[0]);
  } catch (error) {
     console.error('Error inserting data into Supabase:', error);
    res.status(500).json({ error: error.message });
  }

}
