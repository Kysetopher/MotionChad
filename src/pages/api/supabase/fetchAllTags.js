import { ServerClient,  validateUser } from '../../../utils/supabase/server';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
    }
  try {
    const supabase = ServerClient(req, res);
    const { user, autherror } = await validateUser(supabase, res);

    if (!user || autherror) {
        console.error('Authentication error:', autherror);
        return res.status(401).json({ error: 'User not authenticated.' });
    }
    
    const { data, error } = await supabase
    .from('cryptolex')
    .select(`
      id,
      tag,
      definition,
      history,
      cryptolex_relatedtags!fk_cryptolex_id(related_tag_id),
      cryptolex_hypernyms!fk_cryptolex_id(hypernym_id)
    `)
    .order('created_at', { ascending: true });

    if (error) throw error;

    const fetchedTags = data.map(tag => ({
      id: tag.id,
      tag: tag.tag,
      definition: tag.definition,
      history: tag.history,
      relatedtags: tag.cryptolex_relatedtags.map(rel => rel.related_tag_id),
      hypernyms: tag.cryptolex_hypernyms.map(hyp => hyp.hypernym_id),
    }));

    res.status(200).json(fetchedTags);
  } catch (error) {
    console.error('Error fetching all tags:', error);
    res.status(500).json({ error: error.message });
  }
}