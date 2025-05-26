import { ServerClient } from '../../../utils/supabase/server';

export default async function handler(req, res) {
  console.log('API request received');
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = ServerClient(req, res);

    // Query for public cards with owner user_id
    const { data, error } = await supabase
      .from('revcards')
      .select(
        `
          id,
          title,
          summary,
          score,
          created_at,
          visibility,
          viewed,
          plate,
          userinput,
          question,
          user_revcards!inner(user_id, access_level)
        `
      )
      .in('visibility', ['PUBLIC_READ', 'PUBLIC_WRITE'])
      .eq('user_revcards.access_level', 'OWNER') // Filter to only include owners
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Transform the fetched data
    const fetchedCards = data.map((card) => ({
      id: card.id,
      title: card.title,
      summary: card.summary,
      visibility: 'PUBLIC_READ',
      score: card.score,
      created_at: card.created_at,
      viewed: card.viewed,
      plate: card.plate,
      userinput: card.userinput,
      question: card.question,
      owner_id: card.user_revcards?.[0]?.user_id || null, // Extract the owner ID
    }));

    res.status(200).json(fetchedCards);
  } catch (error) {
    console.error('Error fetching all public cards:', error);
    res.status(500).json({ error: error.message });
  }
}
