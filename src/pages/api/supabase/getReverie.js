import { ServerClient,  validateUser } from '../../../utils/supabase/server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const { tileId } = req.query;

  // Validate tileId
  if (!tileId) {
    return res.status(400).json({ error: 'tileId is required' });
  }

  try {
    const supabase = ServerClient(req, res);

    const { user, autherror } = await validateUser(supabase, res);

    if (!user || autherror) {
        console.error('Authentication error:', autherror);
        return res.status(401).json({ error: 'User not authenticated.' });
    }
    const userId = user?.id || null;

    // Query the database for the specified tileId
    const { data, error } = await supabase
      .from('revcards')
      .select(`
        id,
        title,
        summary,
        score,
        created_at,
        visibility,
        viewed,
        is_streaming,
        plate,
        userinput,
        question,
        version,
        revcards_tileresponses!revcards_tileresponses_revcard_id_fkey(tileresponse_id),
        revcards_cryptolex!fk_revcard(cryptolex_id),
        revcards_tileresponses_reverse:revcards_tileresponses!revcards_tileresponses_tileresponse_id_fkey(revcard_id),
        user_revcards!inner(user_id, access_level)
      `)
      .eq('id', tileId)
      .single();

    // Handle potential errors
    if (error) {
      throw error;
    }

    // Extract and format tags and tiles
    const linkedTiles = [
      ...data.revcards_tileresponses.map((tile) => tile.tileresponse_id),
      ...data.revcards_tileresponses_reverse.map((tile) => tile.revcard_id),
    ];
    const tags = data.revcards_cryptolex.map((tile) => tile.cryptolex_id);

    // Check for the current user's access level
    const userAccess = userId
      ? data.user_revcards.find((rel) => rel.user_id === userId)
      : null;

    // Determine access level
    const accessLevel = userAccess ? userAccess.access_level : null;

    // Extract all users with their user_id and access_level
    const usersWithAccess = data.user_revcards.map((rel) => ({
      user_id: rel.user_id,
      access_level: rel.access_level,
    }));

    // Send the data back to the client
    res.status(200).json({
      id: data.id,
      is_streaming: data.is_streaming,
      title: data.title,
      summary: data.summary,
      score: data.score,
      created_at: data.created_at,
      viewed: data.viewed,
      plate: data.plate,
      userinput: data.userinput,
      question: data.question,
      visibility: data.visibility,
      version: data.version,
      tiles: linkedTiles,
      tags: tags,
      access_level: accessLevel,
      users_with_access: usersWithAccess, // New property with user details
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}