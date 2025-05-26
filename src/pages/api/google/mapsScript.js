export default async function handler(req, res) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const libraries = ['places', 'marker'];
  const mapId = process.env.GOOGLE_MAPS_ID;

  if (!mapId) {
    res.status(500).json({ error: 'Map ID is not set' });
    return;
  }

  const url = new URL('https://maps.googleapis.com/maps/api/js');
  url.searchParams.append('key', apiKey);
  url.searchParams.append('libraries', libraries.join(','));
  url.searchParams.append('map_id', mapId);

  res.status(200).json({ url: url.toString() });
}