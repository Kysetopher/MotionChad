import { ServerClient } from '../../../utils/supabase/server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
  }

  try {
      const supabase = ServerClient(req, res);
      let { data: currentTimeData, error: currentTimeError }  = await supabase.rpc('get_current_timestamp');

      if (currentTimeError) throw currentTimeError;

      const currentTimestamp = new Date(currentTimeData[0].now);
      res.status(200).json({ timestamp: currentTimestamp });
  } catch (error) {
      console.error('Error retrieving timestamp', error);
      res.status(500).json({ error: error.message });
  }
  
}
