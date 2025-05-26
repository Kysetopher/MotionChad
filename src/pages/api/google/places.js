export default async function handler(req, res) {
  const { query, useLocation, userLocation } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const locationBias = useLocation && userLocation ? {
      circle: {
        center: {
          latitude: userLocation.lat,
          longitude: userLocation.lng
        },
        radius: 10000.0,
      }
    } : undefined;

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: 5,
        languageCode: 'en',
        locationBias,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}