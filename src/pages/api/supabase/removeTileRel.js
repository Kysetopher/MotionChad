import { ServerClient,  validateUser } from '../../../utils/supabase/server';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { tileId, revId } = req.body;

    try {
      const supabase = ServerClient(req, res);
      const { user, autherror } = await validateUser(supabase, res);

      if (!user || autherror) {
          console.error('Authentication error:', autherror);
          return res.status(401).json({ error: 'User not authenticated.' });
      }
      const { error: relationshipError } = await supabase
        .from('revcards_tileresponses')
        .delete()
        .eq('revcard_id', revId)
        .eq('tileresponse_id', tileId);

      if (relationshipError) {
        throw new Error(relationshipError.message);
      }

      res.status(200).json({ message: `Tag relationship removed for tag: ${tileId}, revId: ${revId}` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}