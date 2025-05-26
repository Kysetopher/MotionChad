
import { ServerClient,  validateUser } from '../../../utils/supabase/server';
import { deleteReverie } from '../../../utils/supabase/functions';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = ServerClient(req, res);
    
    const { user, autherror } = await validateUser(supabase, res);

    if (!user || autherror) {
        console.error('Authentication error:', autherror);
        return res.status(401).json({ error: 'User not authenticated.' });
    }

    const  {cardId } = req.body;
    const result = await deleteReverie(supabase, cardId);
    if (result.success) {
      res.status(200).json({ success: true });
    } else {
      throw new Error(result.error);
    }

  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: error.message });
  }
}