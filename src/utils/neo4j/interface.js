

import  requestQueue  from '../client/requestQueue';

const graphInterface = {

//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |       NEO4J UPSERT       |
//-----------------------------------------|__________________________|---------------------------------------------------------------
  
async addSpreadsheet(data) { // send Spreadsheet Data to backend to upload to neo4j
    try {
        const response = await fetch('/api/neo4j/addSpreadSheet', {  
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data }),
        });
  
        const result = await response.json();
        if (!response.ok) {
          console.error(result.error);
          return null;
        }

        return result.s;
      } catch (error) {
        console.error('Error adding spreadsheet:', error);
        return null;
      }
},

//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |     NEO4J EDIT / DELETE  |
//-----------------------------------------|__________________________|---------------------------------------------------------------
 
async updateSpreadsheet(tableId, updatedData) { // sends a spreadsheet id and updated data to backend to upload to neo4j. used to update spreadsheet data of plate objects. 
    if (requestQueue) {
        try {

        await requestQueue.queueFetch('/api/neo4j/updateSpreadsheet', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tableId, data: updatedData})
            });
            if (response.ok) {
            const success = await response.json();

            return success;

            } else {
            console.error('Failed to update spreadsheet');
            }
        } catch (error) {
            console.error('Error updating spreadsheet:', error);
        }
    }
},
//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |         NEO4J GET        |
//-----------------------------------------|__________________________|---------------------------------------------------------------

async getSpreadSheet( tableId ) { // sends a request to backend to query for a table is the given id and returns all data associated with the table.
    
    try {
        const response = await fetch(`/api/neo4j/getSpreadsheet?tableId=${tableId}`);
        if (response.ok) {
          const data = await response.json();
          return data;
        } else  {
          console.error('Failed to fetch spreadsheet');
        }
      } catch (error) {
        console.error('Error fetching table data:', error);
      }
},

};
export default graphInterface;