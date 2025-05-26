import { ServerClient, validateUser } from '../../../utils/supabase/server';

export default async function handler(req, res) {
  console.log('API request received');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = ServerClient(req, res);
    const { user, error } = await validateUser(supabase, res);

    if (!user || error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ error: 'User not authenticated.' });
    }

    const userId = user.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data: chatDetails, error: chatDetailsError } = await supabase
      .from('chat')
      .select(`
        id,
        text,
        created_at,
        revcard_id,
        user,
        suggestions,
        viewed,
        clarification,
        user_id,
        receiver_id,
        revcards (
          title
        )
      `)
      .or(`user_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true });

    if (chatDetailsError) throw chatDetailsError;

    if (!chatDetails || chatDetails.length === 0) {
      return res.status(200).json({ users: [] });
    }

    const users = {};

    for (const chat of chatDetails) {

      const otherUserId = chat.user_id === userId ? chat.receiver_id : chat.user_id;
      const userKey = otherUserId || 'agent';

      if (!users[userKey]) {
        users[userKey] = {
          id: otherUserId || null, 
          chats: [],
        };
      }

      users[userKey].chats.push({
        id: chat.id,
        text: chat.text, 
        suggestions: chat.suggestions,         
        created_at: chat.created_at,
        revcard_id: chat.revcard_id,
        viewed:chat.viewed,
        clarification: chat.clarification,
        card_name: chat.revcards?.title,
        user: chat.user ? chat.user_id === userId : chat.user, 
      });
    }

    const userArray = Object.values(users);

    res.status(200).json(userArray);
  } catch (error) {
    console.error('Error fetching user-specific chats:', error);
    res.status(500).json({ error: error.message });
  }
}
