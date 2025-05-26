import { runQuery } from '../../../utils/neo4j/operation';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { tableId, data } = req.body;
  if (!tableId || data === undefined) {
    return res.status(400).json({ error: 'Missing tableId or data in request body' });
  }
  
  try {
    const query = 'MATCH (s:Spreadsheet {id: $tableId}) SET s.data = $data RETURN s';
    const result = await runQuery(query, { tableId, data });
    if (result.length === 0) {
      return res.status(404).json({ error: 'Spreadsheet not found' });
    }
    return res.status(200).json(result[0].s);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update spreadsheet' });
  }
}
