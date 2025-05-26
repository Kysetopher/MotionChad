import { ServerClient,  validateUser } from '../../../utils/supabase/server';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
    }

    const { revcardId } = req.query;
    
    if (!revcardId) {
        res.status(400).json({ error: 'Missing revcardId parameter' });
        return;
    }

    try {
        const supabase = ServerClient(req, res);
        const { user, autherror } = await validateUser(supabase, res);

        if (!user || autherror) {
            console.error('Authentication error:', autherror);
            return res.status(401).json({ error: 'User not authenticated.' });
        }
        const { data, error } = await supabase
            .from('revcards_cryptolex')
            .select('cryptolex(*)')
            .eq('revcard_id', revcardId);

        if (error) {
            throw new Error(error.message);
        }

        res.status(200).json({ data: data.map(item => item.cryptolex) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}