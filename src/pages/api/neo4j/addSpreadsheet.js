import { runQuery } from '../../../utils/neo4j/operation';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { tableId, data } = req.body;
  if (data === undefined) {
    return res.status(400).json({ error: 'Missing data in request body' });
  }
  
  // Generate a new tableId if none is provided
  const newTableId = tableId || uuidv4();
  
  try {
    const query = 'CREATE (s:Spreadsheet {id: $tableId, data: $data}) RETURN s';
    const result = await runQuery(query, { tableId: newTableId, data });
    return res.status(201).json(result[0].s);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to add spreadsheet' });
  }
}
