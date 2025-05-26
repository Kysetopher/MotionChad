import { ServerClient,  validateUser } from '../../../utils/supabase/server';

const priceLevelMap = {
    'PRICE_LEVEL_FREE': 0,
    'PRICE_LEVEL_INEXPENSIVE': 1,
    'PRICE_LEVEL_MODERATE': 2,
    'PRICE_LEVEL_EXPENSIVE': 3,
    'PRICE_LEVEL_VERY_EXPENSIVE': 4
  };
  
  export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const places = req.body;
  
    try {
      const supabase = ServerClient(req, res);
      const { user, autherror } = await validateUser(supabase, res);

      if (!user || autherror) {
        console.error('Authentication error:', autherror);
        return res.status(401).json({ error: 'User not authenticated.' });
      }
      for (const place of places) {
        if (!place.location) {
          console.error('Invalid place data:', place);
          continue;
        }
  
        const { error } = await supabase
          .from('places')
          .upsert({
            place_id: place.id,
            name: place.displayName?.text || '',
            formatted_address: place.formattedAddress,
            latitude: place.location.latitude,
            longitude: place.location.longitude,
            rating: place.rating || null,
            user_ratings_total: place.userRatingCount || null,
            price_level: place.priceLevel ? priceLevelMap[place.priceLevel] : null,
            types: place.types || [],
            website: place.websiteUri || null,
            phone_number: place.internationalPhoneNumber || null,
            description: place.editorialSummary?.text || null,
            primary_type: place.primaryType || null,
            primary_type_display_name: place.primaryTypeDisplayName || null,
            photo_reference: place.photos?.[0]?.name || null,
            opening_hours: place.currentOpeningHours ? JSON.stringify(place.currentOpeningHours) : null,
            regular_opening_hours: place.regularOpeningHours ? JSON.stringify(place.regularOpeningHours) : null,
          }, 
          { onConflict: 'place_id' });
  
        if (error) {
          console.error('Error adding place to Supabase:', error);
        } else {
          console.log('Place added/updated in Supabase:', place.displayName?.text || 'Unnamed place');
        }
      }
  
      res.status(200).json({ message: 'Places saved successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }