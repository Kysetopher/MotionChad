import { ServerClient,  validateUser } from '../../../utils/supabase/server';
import { batchUpdateReveries } from '../../../utils/supabase/functions';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { updatedData } = req.body;
  console.log(updatedData);
  if (!Array.isArray(updatedData) || updatedData.length === 0) {
    return res.status(400).json({ error: 'Invalid input data. Updates should be a non-empty array.' });
  }

  try {
    const supabase = ServerClient(req, res);
    const { user, autherror } = await validateUser(supabase, res);

    if (!user || autherror) {
        console.error('Authentication error:', autherror);
        return res.status(401).json({ error: 'User not authenticated.' });
    }
    
    const result = await batchUpdateReveries(supabase, updatedData);

    if (result.success) {
      return res.status(200).json({ success: true, data: result.data });
    } else {
      return res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in batch update endpoint:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
