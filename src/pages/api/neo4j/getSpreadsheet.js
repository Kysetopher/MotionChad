import { runQuery } from '../../../utils/neo4j/operation';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { tableId } = req.query;
  if (!tableId) {
    return res.status(400).json({ error: 'Missing tableId parameter' });
  }
  
  try {
    // Assuming a Spreadsheet node has properties id and data
    const query = 'MATCH (s:Spreadsheet {id: $tableId}) RETURN s';
    const result = await runQuery(query, { tableId });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }
    
    return res.status(200).json(result[0].s);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch spreadsheet' });
  }
}
