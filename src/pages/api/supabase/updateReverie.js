import { ServerClient,  validateUser } from '../../../utils/supabase/server';
import { updateReverie } from '../../../utils/supabase/functions';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { revId, updatedData } = req.body;

  if (!revId || !updatedData) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
    const supabase = ServerClient(req, res);
    const { user, autherror } = await validateUser(supabase, res);

    if (!user || autherror) {
      console.error('Authentication error:', autherror);
      return res.redirect(302, '/api/auth/login');
    }

    const result = await updateReverie(supabase, revId, updatedData);

    if (result.success) {
      return res.status(200).json({ success: true, data: result.data });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error updating reverie:', error);
    return res.status(500).json({ error: error.message });
  }
}