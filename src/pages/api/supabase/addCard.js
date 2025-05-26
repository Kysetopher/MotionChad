import { addCard } from '../../../utils/supabase/functions';
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
      return res.redirect(302, '/api/auth/login');
    }

    const { cardData } = req.body;

    const cardId = await addCard(supabase, cardData);

    res.status(200).json({ id: cardId });
  } catch (error) {
    console.error('Error inserting card data into Supabase:', error);
    res.status(500).json({ error: error.message });
  }
}