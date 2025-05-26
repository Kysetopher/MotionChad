import { ServerClient,  validateUser } from '../../../utils/supabase/server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const { contactId } = req.query;

  if (!contactId) {
    return res.status(400).json({ error: 'contactId is required' });
  }
  
  try {
    const supabase = ServerClient(req, res);
    const { user, autherror } = await validateUser(supabase, res);

    if (!user || autherror) {
        console.error('Authentication error:', autherror);
        return res.status(401).json({ error: 'User not authenticated.' });
    }

    const { data, error } = await supabase
      .from('contacts')
      .select(`
        id,
        first_name,
        last_name,
        phone_number,
        email
      `)
      .eq('id', contactId)
      .single();

    // Handle potential errors
    if (error) {
      throw error;
    }


    res.status(200).json(data);
  } catch (error) {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: error.message });
  }
}