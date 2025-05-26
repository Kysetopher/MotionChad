
import { deleteInsight } from './supabase/functions';
import  requestQueue  from './client/requestQueue';

const ReverieManager = {

//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |      SUPABASE UPSERT     |
//-----------------------------------------|__________________________|---------------------------------------------------------------
  
async addChat(chatData) { // send Chat Data to backend to upload to supabase
  try {

    const response = await fetch('/api/supabase/addChat', {  
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatData })
    });

    const result = await response.json();
    if (!response.ok) {
      console.error(result.error);
    }

    return result.id;
  } catch (error) {
    console.error('Error adding chatdata:', error);
    return null;
  }
},

async addCard(cardData) { // send Card Data to backend to upload to supabase
  try {

    const response = await fetch('/api/supabase/addCard', {  
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cardData })
    });

    const result = await response.json();
    if (!response.ok) {
      console.error(result.error);
    }

    return result.id;
  } catch (error) {
    console.error('Error adding card:', error);
    return null;
  }
},

async addContact(contactData) { // send Contact Data to baken to upload to supabase
  try {

    const response = await fetch('/api/supabase/addContact', {  
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contactData })
    });

    const result = await response.json();
    if (!response.ok) {
      console.error(result.error);
    }
    console.log(result.id);
    return result.id;
  } catch (error) {
    console.error('Error adding card:', error);
    return null;
  }
},

async addTags(tagData) { // Sends an array of tag data and user session to beckend to upload to supabase
  try {
    const response = await fetch('/api/supabase/addTags', {  
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tagData })
    });

    const result = await response.json();
    if (!response.ok) {
      console.error(result.error);
    }

    return result.tagIds; // Return array of tag IDs
  } catch (error) {
    console.error('Error adding tags:', error);
    return null;
  }
},
  
async addTileRel(tileId, revId) { // send tile ID and reverie ID and user session to backend to upload thier relationship to supabase
  try {
    if (!tileId || !revId) console.error('Invalid tileId or revId');

    const response = await fetch('/api/supabase/addTileRel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tileId, revId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(errorData.error || 'Failed to insert tile relationship data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error inserting data via endpoint:', error.message || error);
    return null;
  }
},

async addTagRel(tagId, revId) { // send tag ID and reverie ID and user session to backend to upload thier relationship to supabase
  try {
    if (!tagId || !revId) console.error('Invalid tagId or revId');

    const response = await fetch('/api/supabase/addTagRel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tagId, revId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(errorData.error || 'Failed to insert tag relationship data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error inserting data via endpoint:', error.message || error);
    return null;
  }
},

async addUserInsight(revcardId, insight) { // send userInsights and associated reverie id with user session to backend to upload data to supabase
  try {

    const response = await fetch('/api/supabase/addUserInsight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({revcardId, insight }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(result.message || 'Error adding user insight');
    }

    console.log('User insight added:', result.message);
  } catch (error) {
    console.error('Error adding user insight:', error);
  }
},

async addPlaces(places){
  const response = await fetch('/api/supabase/addPlaces', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(places),
  });

  if (!response.ok) {
    console.error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log(data.message);
},

//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |  SUPABASE EDIT / DELETE  |
//-----------------------------------------|__________________________|---------------------------------------------------------------
 
async deleteReverie(cardId) { // sends card or tile id to backend enpoint to be deleted from supabase
  try {
    const response = await fetch('/api/supabase/deleteReverie', { 
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cardId: cardId }),
    });

    if (!response.ok) {
      console.error(`Failed to delete card: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.success) {
      console.log('Card deleted successfully');
      return true;
  
    } else {
      console.error('Failed to delete card:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Error deleting card:', error);
    return false;
  }
},
async deleteInsight(insightId) { // sends card or tile id to backend enpoint to be deleted from supabase
  console.log(insightId)
  try {
    const response = await fetch('/api/supabase/deleteInsight', { 
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ insightId: insightId }),
    });

    if (!response.ok) {
      console.error(`Failed to delete insight: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.success) {
      console.log('insight deleted successfully');
      return true;
  
    } else {
      console.error('Failed to delete insight:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Error deleting insight:', error);
    return false;
  }
},
async updateReverie(revId, updatedData) {// sends a reverie id and updated data to backend to upload to supabse. used to update all cards and tiles. 
  if (requestQueue) {
    try {
      await requestQueue.queueFetch(
        '/api/supabase/updateReverie',
        'PUT',
        {
          'Content-Type': 'application/json',
        },
        JSON.stringify({ revId, updatedData })
      );

 
      return { success: true, message: 'Reverie updated successfully' };
      
    } catch (error) {
      console.error('Error queuing reverie update:', error);
      return { success: false, message: error.message };
    }
  } else {
    console.error('Request queue is not ready');
    return { success: false, message: 'Request queue is not ready' };
  }
},
async batchUpdateReveries( updatedData ) {// sends a  updated data contaiting updates for mulitiple reveries to backend to upload to supabase in a batch request. used to update cards when sorting many cards. 
  if (requestQueue) {
    try {
      await requestQueue.queueFetch(
        '/api/supabase/batchUpdateReveries',
        'PUT',
        {
          'Content-Type': 'application/json',
        },
        JSON.stringify({ updatedData })
      );

 
      return { success: true, message: 'Reverie updated successfully' };
      
    } catch (error) {
      console.error('Error queuing reverie update:', error);
      return { success: false, message: error.message };
    }
  } else {
    console.error('Request queue is not ready');
    return { success: false, message: 'Request queue is not ready' };
  }
},
async updateContact(contactId, updatedData) {// sends a contact id and updated data to backend to upload to supabase. used to update all contacts. 
  if (requestQueue) {
    try {
      await requestQueue.queueFetch(
        '/api/supabase/updateContact',
        'PATCH',
        {
          'Content-Type': 'application/json',
        },
        JSON.stringify({ contactId, updatedData })
      );

 
      return { success: true, message: 'Contact updated successfully' };
      
    } catch (error) {
      console.error('Error queuing contact update:', error);
      return { success: false, message: error.message };
    }
  } else {
    console.error('Request queue is not ready');
    return { success: false, message: 'Request queue is not ready' };
  }
},

async updateChat(chatId, updatedData) {// sends a chat id and updated data to backend to upload to supabase. used to update chat messages. 
  if (requestQueue) {
    try {
      await requestQueue.queueFetch(
        '/api/supabase/updateChat',
        'PATCH',
        {
          'Content-Type': 'application/json',
        },
        JSON.stringify({ chatId, updatedData })
      );

 
      return { success: true, message: 'Chat updated successfully' };
      
    } catch (error) {
      console.error('Error queuing chat update:', error);
      return { success: false, message: error.message };
    }
  } else {
    console.error('Request queue is not ready');
    return { success: false, message: 'Request queue is not ready' };
  }
},

async removeTagRel(tagId, revId) { // sends a tag id and an associated reverie id to backend to send a request to delete the association on supabase.
  try {
    const response = await fetch('/api/supabase/removeTagRel', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tagId, revId }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      console.error(error);
    }
  } catch (error) {
    console.error('Error removing tag relationship:', error);
  }
},

async removeTileRel(tileId, revId) { // sends a tile id and an associated reverie id to backend to send a request to delete the association on supabase.
  try {
    const response = await fetch('/api/supabase/removeTileRel', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tileId, revId }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      console.error(error);
    }

    const { message } = await response.json();
    console.log(message);
  } catch (error) {
    console.error('Error removing tag relationship:', error);
  }
},
//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |      SUPABASE GET        |
//-----------------------------------------|__________________________|---------------------------------------------------------------

async fetchAllUserCards() { // sends a request to backend to grab all cards that are linked to the users via the user_revcards table
  try {
    const response = await fetch('/api/supabase/fetchAllUserCards');
    if (!response.ok) {
      console.error('Failed to fetch cards');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all cards:', error);
    return error;
  }
},

async fetchAllPublicCards() { // sends a request to backend to grab all public cards from supabase
  try {
    const response = await fetch('/api/supabase/fetchAllPublicCards');
    if (!response.ok) {
      console.error('Failed to fetch all public cards');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all public cards:', error);
    return [];
  }
},

async fetchAllUserInsights() { // sends a request to backend to grab all user insights from supabase
  try {
    const response = await fetch('/api/supabase/fetchAllUserInsights');
    if (!response.ok) {
      console.error('Failed to fetch all user insights');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all user insights:', error);
    return [];
  }
},

async fetchAllUsers() { // sends a request to backend to grab all users from supabase
  try {
    const response = await fetch('/api/supabase/fetchAllUsers');
    if (!response.ok) {
      console.error('Failed to fetch all users');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
},

async fetchAllContacts() { // sends a request to backend to grab all contactsfrom supabase
  try {
    const response = await fetch('/api/supabase/fetchAllContacts');
    if (!response.ok) {
      console.error('Failed to fetch contacts');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all contacts:', error);
    return [];
  }
},

async fetchAllChat() { // sends a request to backend to grab all chat history
  try {
    const response = await fetch('/api/supabase/fetchAllChat');
    if (!response.ok) {
      console.error('Failed to fetch chat');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all chat:', error);
    return [];
  }
},

async fetchAllTags(){  // sends a request to backed to grab all tags from supabase.
  try {
    const response = await fetch('/api/supabase/fetchAllTags');
    if (!response.ok) {
      console.error('Failed to fetch tags');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all tags:', error);
    return [];
  }
},

async getUserData() { // sends a request to backend to get user data for the currently authenticated user
  try {
    const response = await fetch('/api/supabase/getUserData');
    if (!response.ok) {
      console.error('Failed to grab user data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return [];
  }
},

async getTileIdsByCardId(cardId) { // sends a request to backend to query the revcards_tileresponses table and get tile ids associated with the given card
  try {
    const response = await fetch(`/api/supabase/getTileIdsByCardId?cardId=${cardId}`);

    if (!response.ok) {
      console.error(`Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.tileIds;
  } catch (error) {
    console.error('Error fetching tile IDs by card ID:', error);
    throw error;
  }
},

async getCardIdByTileId(tileId) { // sends a request to backend to query the revcards_tilereponses table and get the card id associated with the given tile id
  try {
    const response = await fetch(`/api/supabase/getCardIdByTileId?tileId=${encodeURIComponent(tileId)}`);

    if (!response.ok) {
     console.error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.cardId === null) {
      return null;
    }

    console.log(result.cardId);
    return result.cardId;

  } catch (error) {
    console.error('Error fetching card ID by tile ID:', error);
    throw error;
  }
},

async getReverieDataById(tileId) { // sends a request to backend to query the revcards tables and get all row data for the reverie(tile or card)
  try {
      const response = await fetch(`/api/supabase/getReverie?tileId=${tileId}`);
      if (!response.ok) {
          console.error(`An error occurred: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
  } catch (error) {
    console.error('Error fetching card: ',tileId,"\n", error.message);
  }
},

async getContactDataById(contactId) { // sends a request to backend to query the revcards tables and get all row data for the reverie(tile or card)
  try {
      const response = await fetch(`/api/supabase/getContact?contactId=${contactId}`);
      if (!response.ok) {
          console.error(`An error occurred: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
  } catch (error) {
    console.error('Error fetching contact: ',contactId,"\n", error.message);
  }
},

async getTagDataById(tagId) { // sends a request to backend to query the cryptolex tables and get all row data for the token (tag)
  try {
      const response = await fetch(`/api/supabase/getTagDataById?tagId=${tagId}`);
      if (!response.ok) {
          console.error(`An error occurred: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
  } catch (error) {
    console.error('Error fetching tag: ',tagId,"\n", error.message);
  }
},

async getTimestamp() { //sends a request to backend to get the current timestamp on the subapase server (can be used to get the current lifespan of a given card or tile)
  try {
    const response = await fetch('/api/supabase/getTimestamp');
    if (!response.ok) {
      console.error('Network response was not ok');
    }

    const { timestamp } = await response.json();
    return new Date(timestamp);
  } catch (error) {
    console.error('Error retrieving timestamp', error);
  }
},
 
async getCryptolexByRevId(revcardId) { //sends a request to backend to query the revcards_cryptolex table and returns all cryptolex tags associated with the given reverie
  try {
      const response = await fetch(`/api/supabase/getCryptolexByRevId?revcardId=${revcardId}`);
      if (!response.ok) {
          console.error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || [];
  } catch (error) {
      console.error('Error fetching cryptolex data:', error);
      return [];
  }
},

//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |      PROCESS INPUT       |
//-----------------------------------------|__________________________|---------------------------------------------------------------
 
async processNewCard(inputData, tempCardId, updateTemporaryCard) { // sends a request to backend to create a card based on the users input

  const cardId = await this.addCard({ title: "Reflecting...", userinput: inputData,summary: inputData, is_streaming: true});
  updateTemporaryCard(tempCardId, { id: cardId, is_streaming: true });


  const bodyPromise = fetch('/api/process/inputNewAgentStream', {
    method: 'POST',
    body: JSON.stringify({ cardId, inputData }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  try {

    const bodyResponse = await bodyPromise;

    if (bodyResponse.ok) {
      const bodyResult = await bodyResponse.json();
      updateTemporaryCard(cardId, { ...bodyResult });
    } else if (bodyResponse.status === 429) {
      console.error('Rate limit exceeded, deleting card');

      await this. deleteReverie(cardId);

      updateTemporaryCard(cardId, { title: "Cannot Complete request: Exceeded rate limit for Free Plan", userinput: inputData });
    } else {
      console.error(`HTTP error! status: ${bodyResponse.status}`);
    }

  } catch (error) {
    console.error('Error processing input:', error);
  }
},
async processEmptyCard(inputData, cardId, updateExistingTile) { // sends a request to backend to create update a currently empty card based on the users input


  const bodyPromise = fetch('/api/process/inputNewAgentStream', {
    method: 'POST',
    body: JSON.stringify({ cardId, inputData }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  try {
    const bodyResponse = await bodyPromise;

    if (bodyResponse.ok) {
      const bodyResult = await bodyResponse.json();
      updateExistingTile(cardId, { ...bodyResult });
    } else if (bodyResponse.status === 429) {
      console.error('Rate limit exceeded, deleting card');

      await this.deleteReverie(cardId);

      updateExistingTile(cardId, { title: "Cannot Complete request: Exceeded rate limit for Free Plan", userinput: inputData });
    } else {
      console.error(`HTTP error! status: ${bodyResponse.status}`);
    }

  } catch (error) {
    console.error('Error processing input:', error);
  }
},
async processUpdateTile(input, processingTileId, updateExistingTile) { // sends a request to backend to update a card based on the users input
  const existingTileData = await this.getReverieDataById(processingTileId);
  const { score, summary, userinput, created_at, viewed, tiles, tags, ...rest } = existingTileData;
  const bodyRequest = {
    tile: { ...rest, userinput: input },
    referencedTiles: [],
  };
  const metaRequest = {
    tile: { ...rest, userinput: input, tags:existingTileData.tags},
    referencedTiles: [],

  };

  try {
    const [metaResponse, bodyResponse] = await Promise.allSettled([
      fetch('/api/process/inputUpdateMeta', {
        method: 'POST',
        body: JSON.stringify( metaRequest ),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      fetch('/api/process/inputUpdateSlate', {
        method: 'POST',
        body: JSON.stringify( bodyRequest ),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ]);

    if (metaResponse.status === 'fulfilled' && metaResponse.value.ok) {
      const metaResult = await metaResponse.value.json();
  
      const combinedTags = [...tags, ...metaResult.tags];

      updateExistingTile(processingTileId, { ...metaResult, tags: combinedTags });

      for (const tagId of metaResult.tags) {
        // console.log("Tag Id:", tagId);
         await this.addTagRel(tagId, processingTileId); 
        }

    } else if (metaResponse.status === 'fulfilled') {
      console.error(`HTTP error! status: ${metaResponse.value.status}`);
    }

    if (bodyResponse.status === 'fulfilled' && bodyResponse.value.ok) {
      const bodyResult = await bodyResponse.value.json();
      updateExistingTile( processingTileId, { ...bodyResult });
    } else if (bodyResponse.status === 'fulfilled') {
      console.error(`HTTP error! status: ${bodyResponse.value.status}`);
    }
  } catch (error) {
    console.error('Error processing and updating tile:', error);
  }
},

async processChatAgent(input) { // sends a request to backend to chat with the agent
 
  const bodyRequest = {inputData: input};

  try {
    const bodyResponse = await fetch('/api/process/inputChat', {
      method: 'POST',
      body: JSON.stringify(bodyRequest),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!bodyResponse.ok) {
      console.error(`HTTP error! status: ${bodyResponse.status}`);
    }

    const bodyResult = await bodyResponse.json(); // Use bodyResponse.json() directly
    console.log("Result:", bodyResult);
    return bodyResult;

  } catch (error) {
    console.error('Error processing and updating tile:', error);
  }
},

//-----------------------------------------|                                    |---------------------------------------------------------------------------
//                                         |   PROCESS SUGGESTION / AUTOMATION  |
//-----------------------------------------|____________________________________|---------------------------------------------------------------
 
async processClarification(inputData, chatId) { // sends a request to backend to answer a question via suggestions workflow
 

  try {
    const bodyResponse = await fetch('/api/process/inputClarification', {
      method: 'POST',
      body: JSON.stringify({chatId, inputData}),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!bodyResponse.ok) {
      console.error(`HTTP error! status: ${bodyResponse.status}`);
    }

    const bodyResult = await bodyResponse.json(); 
    console.log("Result:", bodyResult);
    return bodyResult;

  } catch (error) {
    console.error('Error processing clarification suggestion:', error);
  }
},
//-----------------------------------------|                                |---------------------------------------------------------------------------
//                                         |      PROCESS API QUERIES       |
//-----------------------------------------|________________________________|---------------------------------------------------------------

async exaSearch(tileData) { // UNUSED! sends a exa search query to backend to be sent to exa and returns the exa response
  console.log("Detected 'exatile' node insertion"); // Debugging statement

  try {
    const response = await fetch('/api/process/exaSearch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: tileData.title }), // Ensure the body is an object with a title property
    });
  
    if (!response.ok) {
      console.error('Failed to fetch data from server calling exaSearch');
    }
  
    const data = await response.json();
    tileData.body = JSON.stringify(data);
    return data.result;

  } catch (error) {
    console.error("exaSearch request Failed:", error); // Error handling

    // Return error in Slate structure
    const errorText = JSON.stringify(error);
    tileData.body = [{"type":"paragraph","children":[{"text":errorText}]}];
  }
  return tileData.body;
},

async sketchfabSearch(cardData) { //sends a sketchfabSearch query to backend to be sent to sketchfab then calls update card to update the card data

    try {
        const response = await fetch( '/api/process/sketchfabSearch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cardData })
        });

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Search result from API:', result);

        if (result.uid) {
            // this.updateReverie(cardData.id, { sketchfab_uid: result.uid });
            return result.uid;
        } else {
            console.warn('No results found');
            return false;
        }

    } catch (error) {
        console.error('Error calling API endpoint:', error);
        return false;
    }
},

};
export default ReverieManager;