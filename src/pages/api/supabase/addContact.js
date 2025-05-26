import { addContact } from '../../../utils/supabase/functions';
import { ServerClient,  validateUser } from '../../../utils/supabase/server';

export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const supabase = ServerClient(req, res);
        const { user, autherror } = await validateUser(supabase, res);

        if (!user || autherror) {
          console.error('Authentication error:', autherror);
          return res.status(401).json({ error: 'User not authenticated.' });
        }

        const { contactData } = req.body;

        const contactId = await addContact(supabase, contactData);
    
      console.log(contactId);
      res.status(200).json({ id: contactId });
    } catch (error) {
        console.error('Error adding user insight:', error);
        res.status(500).json({ message: 'Error adding user insight', error });
  }
};