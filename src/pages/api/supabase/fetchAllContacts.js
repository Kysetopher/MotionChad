import { ServerClient,  validateUser } from '../../../utils/supabase/server';

export default async function handler(req, res) {
  console.log('API request received');
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
    
    const { data, error } = await supabase
    .from('contacts')
    .select(`
        id,
        first_name,
        last_name,
        phone_number,
        email
    `)
    .order('created_at', { ascending: true });

    if (error) throw error;


    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching all contacts:', error);
    res.status(500).json({ error: error.message });
  }
}