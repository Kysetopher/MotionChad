import { ServerClient,  validateUser } from '../../../utils/supabase/server';

export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { revcardId, insight } = req.body;
    const token = req.headers.authorization?.split(' ')[1]; // Extract the token from the 'Bearer <token>' format

    if (!revcardId || !insight) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }

    if (!token) {
        return res.status(401).json({ error: 'Authorization token is required' });
    }
    try {
        const supabase = ServerClient(req, res);
        const { user, autherror } = await validateUser(supabase, res);

        if (!user || autherror) {
            console.error('Authentication error:', autherror);
            return res.status(401).json({ error: 'User not authenticated.' });
        }
        const userId = user.id;

        const { data: existingInsight, error: fetchError } = await supabase
        .from('user_insights')
        .select('id, score')
        .eq('user_id', userId)
        .eq('revcard_id', revcardId)
        .eq('insight', insight)
        .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
        }

        if (existingInsight) {
        // Update the score if the insight exists
        const newScore = existingInsight.score + 1;
        const { error: updateError } = await supabase
            .from('user_insights')
            .update({ score: newScore })
            .eq('id', existingInsight.id);

        if (updateError) {
            throw updateError;
        }
        } else {
      // Insert a new insight if it does not exist
      const { error: insertError } = await supabase
        .from('user_insights')
        .insert([{ user_id: userId, revcard_id: revcardId, insight }]);

      if (insertError) {
        throw insertError;
      }
    }

    res.status(200).json({ message: 'Insight added successfully' });
    } catch (error) {
        console.error('Error adding user insight:', error);
        res.status(500).json({ message: 'Error adding user insight', error });
  }
};