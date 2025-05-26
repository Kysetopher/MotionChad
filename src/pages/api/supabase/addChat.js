import { addChat } from '../../../utils/supabase/functions';
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

    const { chatData } = req.body;

    const chatId = await addChat(supabase, chatData);

    res.status(200).json({ id: chatId });
  } catch (error) {
    console.error('Error inserting data into Supabase:', error);
    res.status(500).json({ error: error.message });
  }
}