

export default async function handler(req, res) {
    const { placeId } = req.query;
    
    if (!placeId) {
      return res.status(400).json({ error: 'Place ID is required' });
    }
  
    try {

      const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,types,rating,userRatingCount,priceLevel,websiteUri,internationalPhoneNumber,editorialSummary,primaryType,photos,currentOpeningHours,regularOpeningHours,primaryTypeDisplayName',
        },
      });
  
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }
  
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }