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
    
    const { contactId, updatedData } = req.body;

    const { data, error } = await supabase
      .from('contacts')
      .update(updatedData)
      .eq('id', contactId)

    if (error) {
      console.error('Error updating database:', error);
      return res.status(500).json({ error: 'Error updating database.' });
    }

    // Send back the updated data
    res.status(200).json(data);
  } catch (error) {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: error.message });
  }
}