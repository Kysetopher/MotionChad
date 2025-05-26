import { ServerClient,  validateUser } from '../../../utils/supabase/server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const { tagId } = req.query;

  if (!tagId) {
    return res.status(400).json({ error: 'tagId is required' });
  }
  const supabase = ServerClient(req, res);
  const { user, autherror } = await validateUser(supabase, res);

  if (!user || autherror) {
      console.error('Authentication error:', autherror);
      return res.status(401).json({ error: 'User not authenticated.' });
  }
  
  const { data, error } = await supabase
    .from('cryptolex')
    .select('*')
    .eq('id', tagId)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
}