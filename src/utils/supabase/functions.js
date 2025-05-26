//-----------------------------------------|                               |---------------------------------------------------------------------------
//                                         |        UPDATE                 | 
//-----------------------------------------|_______________________________|---------------------------------------------------------------
export async function batchUpdateReveries(supabase, updates) {
  try {
    const { data, error } = await supabase
      .from('revcards')
      .upsert(updates, { onConflict: 'id' }); // 'id' is assumed to be the unique key

    if (error) {
      throw new Error(error.message);
    }
    return { success: true, data };
  } catch (error) {
    console.error('Error batch updating revcards:', error);
    return { success: false, error: error.message };
  }
}

export async function updateReverie(supabase, revId, updatedData) {
  try {
    let { version: clientVersion, ...dataToUpdate } = updatedData;

    // Fetch current version
    const { data: current, error: fetchError } = await supabase
      .from('revcards')
      .select('version')
      .eq('id', revId)
      .single();

    if (fetchError || !current) {
      return { success: false, error: 'Could not fetch current version.' };
    }

    if (clientVersion == null) {
      clientVersion = current.version; 
    }


    const { data, error: updateError } = await supabase
      .from('revcards')
      .update({
        ...dataToUpdate,
        version: clientVersion + 1, 
      })
      .eq('id', revId)
      .select();

    if (updateError) {
      throw new Error(updateError.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating revcard:', error);
    return { success: false, error: error.message };
  }
}

export async function updateChat(supabase, chatId, updatedData) {
  try {
    const { data, error } = await supabase
      .from('chat')
      .update(updatedData)
      .eq('id', chatId);

    if (error) {
      throw new Error(error.message);
    }
    return { success: true, data };
  } catch (error) {
    console.error('Error updating chat:', error);
    return { success: false, error: error.message };
  }
}
export async function updateUserInsight(supabase, insightId, updatedData) {
  try {
    const { data, error } = await supabase
      .from('user_insights')
      .update(updatedData)
      .eq('id', insightId);

    if (error) {
      throw new Error(error.message);
    }
    return { success: true, data };
  } catch (error) {
    console.error('Error updating insight:', error);
    return { success: false, error: error.message };
  }
}
export async function deleteReverie(supabase, revId) {
  try {

    const { error } = await supabase.from('revcards').delete().eq('id', revId);
    if (error) throw error;

    return { success: true};
  } catch (error) {
    console.error('Deleting Reverie:', error);
    return { success: false, error: error.message };
  }
}
export async function deleteInsight(supabase, insightId) {
  try {

    const { error } = await supabase.from('user_insights').delete().eq('id',  insightId);
    if (error) throw error;

    return { success: true};
  } catch (error) {
    console.error('Deleting Insight:', error);
    return { success: false, error: error.message };
  }
}
//-----------------------------------------|                            |---------------------------------------------------------------------------
//                                         |        GET                 | 
//-----------------------------------------|____________________________|---------------------------------------------------------------

export async function getTileIdsByCardId(supabase, cardId) {
  try {
    const { data, error } = await supabase
      .from('revcards_tileresponses')
      .select('tileresponse_id')
      .eq('revcard_id', cardId);

    if (error) throw error;
    return { success: true , data };
  } catch (error) {
    console.error('Getting tile IDs:', error);
    return { success: false, error: error.message };
  }
}

export async function getRelIdsByTagId(supabase, tagId) {
  try {
    const { data, error } = await supabase
      .from('cryptolex_relatedtags')
      .select('related_tag_id')
      .eq('cryptolex_id', tagId);

    if (error) throw error;
    return { success: true , data };
  } catch (error) {
    console.error('Getting related tag IDs:', error);
    return { success: false, error: error.message };
  }
}

export async function getHypIdsByTagId(supabase, tagId) {
  try {
    const { data, error } = await supabase
      .from('cryptolex_hypernyms')
      .select('hypernym_id')
      .eq('cryptolex_id', tagId);

    if (error) throw error;
    return { success: true , data };
  } catch (error) {
    console.error('Getting hypernym IDs:', error);
    return { success: false, error: error.message };
  }
}

export async function getRecentAgentChatHistory(supabase, matchCount = 3) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw new Error('Authentication failed');

    const userId = user.id;
    const { data, error } = await supabase
      .from('chat')
      .select('text')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // Sort by most recent
      .limit(matchCount); // Limit to the matchCount

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Getting Recent Agent Chat History:', error);
    return { success: false, error: error.message };
  }
}

//-----------------------------------------|                            |---------------------------------------------------------------------------
//                                         |        RETRIEVE            | 
//-----------------------------------------|____________________________|---------------------------------------------------------------

export async function retrieveEmbeddings(supabase, embedding) {
  const  matchCount = 4;
  try {

    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.38, // Adjust the similarity threshold as needed
      match_count: matchCount,
    });

    if (error) {
      throw new Error(error.message);
    }
    return { success: true, data };
  } catch (error) {
    console.error('Error retrieving similar documents:', error);
    return { success: false, error: error.message };
  }
}

export async function retrieveReveries(supabase, embedding) {
  const  matchCount = 4;
  try {

    const { data, error } = await supabase.rpc('match_revcards', {
      query_embedding: embedding,
      match_threshold: 0.7, // Adjust the similarity threshold as needed
      match_count: matchCount,
    });

    if (error) {
      throw new Error(error.message);
    }
    return { success: true, data };
  } catch (error) {
    console.error('Error retrieving similar cards:', error);
    return { success: false, error: error.message };
  }
}
export async function retrieveUserInsights(supabase, embedding) {
  const  matchCount = 4;
  try {

    const { data, error } = await supabase.rpc('match_user_insights', {
      query_embedding: embedding,
      match_threshold: 0.32, // Adjust the similarity threshold as needed
      match_count: matchCount,
    });

    if (error) {
      throw new Error(error.message);
    }
    return { success: true, data };
  } catch (error) {
    console.error('Error retrieving similar user insights:', error);
    return { success: false, error: error.message };
  }
}
//-----------------------------------------|                            |---------------------------------------------------------------------------
//                                         |        INSERT              | 
//-----------------------------------------|____________________________|---------------------------------------------------------------

export async function addContact(supabase, contactData) {
  const { data: session, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!session) throw new Error('User not authenticated');
  
  const { data, error } = await supabase.from('contacts').insert([contactData]).select();
  if (error) throw error; 

  return data[0].id;
}



export async function addUserInsight(supabase, insightData) {
  const { data: session, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!session) throw new Error('User not authenticated');
  
  const { data, error } = await supabase.from('user_insights').insert([insightData]).select();
  if (error) throw error; 

  return data[0].id;

}

export async function addCard(supabase, cardData) {
  const { data: session, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!session) throw new Error('User not authenticated');
  
  const { data, error } = await supabase.from('revcards').insert([cardData]).select();
  if (error) throw error; 

  return data[0].id;
}
export async function addChat(supabase, chatData) {
  const { data: session, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!session) throw new Error('User not authenticated');
  
  const { data, error } = await supabase.from('chat').insert([chatData]).select();
  if (error) throw error; 

  return data[0].id;
}

export async function addTags(supabase, tagData) {
  const { data: session, error: authError } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!session) throw new Error('User not authenticated');

  const tagIds = [];

  for (let tag of tagData) {
    tag = tag.toLowerCase().trim();
    
    const { data: existingTag, error: fetchError } = await supabase
      .from('cryptolex')
      .select('id')
      .eq('tag', tag)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    let tagId;
    if ( !existingTag ) {
      const { data, error } = await supabase
        .from('cryptolex')
        .insert([{ tag }])
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("No data returned from insert operation");

      tagId = data[0].id;
    } else {
      tagId = existingTag.id;
    }

    tagIds.push(tagId);
  }

  return tagIds;
}

export async function addEmbedding(supabase, content, embedding) {
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert([{ content, embedding }]);

    if (error) {
      throw new Error(error.message);
    }
    return { success: true, data };
  } catch (error) {
    console.error('Error storing embedding:', error);
    return { success: false, error: error.message };
  }
}
