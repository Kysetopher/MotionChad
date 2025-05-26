import { ServerClient } from '../../../utils/supabase/server';
import { updateReverie } from '../../../utils/supabase/functions';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} not allowed`);
        return;
    }

    const { cardData } = req.body;

    const sketchfabSearchUrl = 'https://api.sketchfab.com/v3/search';

    const params = {
        q: cardData.modelprompt,
        type: 'models',
        downloadable: true,
        sort_by: '-likes',
        per_page: 10
    };

    const queryString = new URLSearchParams(params).toString();
    const url = `${sketchfabSearchUrl}?${queryString}`;

    try {
        const supabase = ServerClient(req, res);
        const sketchfabresponse = await fetch(url);
        if (!sketchfabresponse.ok) {
            throw new Error(`HTTP error! status: ${sketchfabresponse.status}`);
        }

        const data = await sketchfabresponse.json();
        const revId = cardData.id;
        const updatedData = { sketchfab_uid: data.results[0]?.uid || null };

        console.log('Updated Data:', updatedData); // Debugging log

        try {
            const result = await updateReverie(supabase, revId, updatedData);
        
            if (result.success) {
                res.status(200).json({ uid: updatedData.sketchfab_uid });
            } else {
              throw new Error(result.error);
            }
          } catch (error) {
            console.error('Error updating reverie:', error);
            return res.status(500).json({ error: error.message });
          }
    } catch (error) {
        console.error('Error fetching search results:', error);
        res.status(500).json({ error: 'Error fetching search results' });
    }
}