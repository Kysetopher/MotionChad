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
    const userId = user.id;

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
          order_index,
          userinput,
          is_streaming,
          question,
          version,
          revcards_tileresponses!revcards_tileresponses_revcard_id_fkey(tileresponse_id),
          revcards_cryptolex!fk_revcard(cryptolex_id),
          revcards_tileresponses_reverse:revcards_tileresponses!revcards_tileresponses_tileresponse_id_fkey(revcard_id),
          user_revcards!inner(user_id, access_level)
        `
      )
      .eq('user_revcards.user_id', userId) // Filter for cards related to the user
      .order('order_index', { ascending: false });

    if (error) throw error;

    // Transform the fetched data
    const fetchedCards = data.map((card) => {
      const linkedTiles = [
        ...card.revcards_tileresponses.map((tile) => tile.tileresponse_id),
        ...card.revcards_tileresponses_reverse.map((tile) => tile.revcard_id),
      ];
      const usersWithAccess = card.user_revcards.map((rel) => ({
        user_id: rel.user_id,
        access_level: rel.access_level,
      }));
      // Find the specific user's access level
      const userAccess = card.user_revcards.find(
        (rel) => rel.user_id === userId
      );

      return {
        id: card.id,
        title: card.title,
        summary: card.summary,
        visibility: card.visibility,
        imgurl:
          'https://codahosted.io/docs/cm71ZTE4aB/blobs/bl-hgj9_flnaC/46a609a192842c66b80b7e5ba48e23d5c64ae7878dcd3172249571f9fc3222231214dc60895a9a51cad9d9562d997de42c46607b7db6843d21645df08df7d8560fc5d13bd93ac6aee4e2b01156af68d858ca56dd4b40a798d54661fa7f9d0c16699e0c80',
        score: card.score,
        created_at: card.created_at,
        viewed: card.viewed,
        plate: card.plate,
        order_index:card.order_index,
        userinput: card.userinput,
        question: card.question,
        is_streaming:card.is_streaming,
        version:card.version,
        tiles: linkedTiles,
        tags: card.revcards_cryptolex.map((tile) => tile.cryptolex_id),
        access_level: userAccess ? userAccess.access_level : null,
        users_with_access: usersWithAccess
      };
    });

    res.status(200).json(fetchedCards);
  } catch (error) {
    console.error('Error fetching all cards:', error);
    res.status(500).json({ error: error.message });
  }
}
