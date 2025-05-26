import plateConverter from '../spells/plateConverter';
import { Node } from 'slate';
import MetaAgent from '../spells/MetaAgent';
import Spells from '../spells/allSpells';
import { updateReverie, addTags, retrieveUserInsights,addUserInsight, updateUserInsight } from './functions';
import promptSelector from '../spells/promptSelector';
import insightManager from '../spells/insightManager';
import _ from 'lodash';

//-----------------------------------------|                               |---------------------------------------------------------------------------
//                                         |  INPUT NEW AGENT STREAM       | 
//-----------------------------------------|_______________________________|---------------------------------------------------------------

export async function InputNewAgentStream(req, res, supabase, apiKey) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { cardId, inputData , userInsights } = req.body;

  try {

    const selectorRequest = {
        model: "gpt-4.1",
        stream: false,
        messages: [
          { role: "system", content: promptSelector.systemPrompt() },
          { role: "user", content: promptSelector.userPrompt(inputData, userInsights)} 

        ],
        response_format: promptSelector.responseFormat(),
        temperature: 0.25
      };

      const selectorResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        body: JSON.stringify(selectorRequest),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      if (!selectorResponse.ok) {
        console.error('Selector Response Error:', await selectorResponse.text());
        throw new Error(`HTTP error! status: ${selectorResponse.status}`);
      }
      const selector = JSON.parse((await selectorResponse.json()).choices[0].message.content);
      const selectedAgent = selector.selected_agent;
  // -----------------------------------------| assigns the agent prompt based on the agent retrieved from selectorResponse |---------------------------------------------------------------
   
      let agentprompt = '';
      switch(selectedAgent){
          // case "quest":
          //     agentprompt = Spells.quest();
          //     break;
          // case "vanta":
          //     agentprompt = Spells.vanta();
          //     break;
          case "engineer":
              agentprompt = Spells.engineer();
              break;
          case "scientific":
              agentprompt = Spells.scientific();
              break;
          case "definition":
              agentprompt = Spells.definition();
              break;
          case "life_sciences":
              agentprompt = Spells.life_sciences();
              break;       
          case "location":
              agentprompt = Spells.location();
              break;
          case "entity":
              agentprompt = Spells.entity();
              break;
          case "images":
              agentprompt = Spells.images();
              break;
          case "songs":
              agentprompt = Spells.songs();
              break;
          case "writer":
              agentprompt = Spells.writer();
              break;
          case "coder":
              agentprompt = Spells.coder();
              break;
          case "strategist":
              agentprompt = Spells.strategist();
              break;
          case "prophet":
              agentprompt = Spells.prophet();
              break;
          case "prompt_engineer":
              agentprompt = Spells.prompt_engineer();
              break;
          case "translator":
              agentprompt = Spells.translator();
              break;
          case "therapist":
              agentprompt = Spells.therapist();
              break;
          default:
              break;
      }
      // agentprompt = "#USER'S INTENTION:\n" + selector.intention + "\n" + agentprompt;
  //-----------------------------------------|  REQUEST:                     |---------------------------------------------------------------------------
  //                                         |  AGENT PROMPT | TEXT RESPONSE | 
  //-----------------------------------------|_______________________________|---------------------------------------------------------------
  // ----------------------------------------| sends a request to openAi to retrieve raw text response using the agent prompt |---------------------------------------------------------------

    // Construct agentRequest as before
    const agentRequest = {
        model: "gpt-4.1", 
        stream: false,
        messages: [
          { role: "system", content: promptSelector.selectedPrompt(selector.intention,agentprompt) },
          { role: "user", content: promptSelector.userPrompt(inputData, userInsights)} 
        ],
        temperature: 0.4
    };
   
    const agentResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        body: JSON.stringify(agentRequest),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
    });
      
    if (!agentResponse.ok) {
        throw new Error(`HTTP error! status: ${agentResponse.status}`);
      }
    const agentText = await agentResponse.json();
    var slateRequest;
        // var slateBody;

  //-----------------------------------------|                               |---------------------------------------------------------------------------
  //                                         |  METADATA & USERINSIFGHT      | 
  //-----------------------------------------|_______________________________|---------------------------------------------------------------
  const metaInput = `#USER'S INTENTION:
${selector.intention}

${inputData}
`
    processMetaData(cardId, inputData, selector.intention, supabase, apiKey);
    generateUserInsight( metaInput,userInsights, supabase, apiKey);
//-----------------------------------------|  REQUEST:                     |---------------------------------------------------------------------------
//                                         |  TEXT INPUT | SLATE RESPONSE  | 
//-----------------------------------------|_______________________________|---------------------------------------------------------------
// ----------------------------------------| sends a request to openAi to retrieve a enriched text using the slate converter |---------------------------------------------------------------
    slateRequest = {
    model: "gpt-4.1",
    stream: true, // Enable streaming
    messages: [
        { role: "system", content: plateConverter.systemPrompt() },
        { role: "user", content: agentText.choices[0].message.content }
    ],
    response_format: plateConverter.responseFormat(),
    temperature: 0.3
    };
    const slateResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify(slateRequest),
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
    },
    });
    if (!slateResponse.ok) {
    const errorDetails = await slateResponse.json();
    throw new Error(`HTTP error! status: ${slateResponse.status}, details: ${JSON.stringify(errorDetails)}`);
    }
    const reader = slateResponse.body.getReader();
const decoder = new TextDecoder();
const slateBody = [];
let buffer = '';
let currentElementBuffer = "";
let isParsing = false; // Track when to start collecting data
function findClosingBrace(str, start) {
  let depth = 0;
  for (let i = start; i < str.length; i++) {
    if (str[i] === "{") depth++;
    if (str[i] === "}") depth--;
    if (depth === 0) return i; // Found the matching closing brace
  }
  return -1; // Incomplete JSON object
}
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const rawChunk = decoder.decode(value, { stream: true });
  buffer += rawChunk;
  try {
    // Split the buffer into individual lines
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep the last incomplete line in the buffer
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine === 'data: [DONE]') continue; 
      if (trimmedLine.startsWith('data:')) {
        const jsonData = trimmedLine.slice(5).trim();
        let parsedLine;
        try {
          parsedLine = JSON.parse(jsonData);
        } catch (err) {
          console.error('Error parsing line:', err);
          continue; // Skip invalid JSON lines
        }
        if (parsedLine.choices && parsedLine.choices[0].delta && parsedLine.choices[0].delta.content) {
          const deltaContent = parsedLine.choices[0].delta.content;
          currentElementBuffer += deltaContent;
          // console.log(currentElementBuffer);
          let endIndex = findClosingBrace(currentElementBuffer,0);
          if (!isParsing && currentElementBuffer.includes('{"body":')) {
            // console.log(currentElementBuffer);
            currentElementBuffer = "";
            isParsing = true;
          }
           if(isParsing & endIndex !== -1) try {
            // console.log(currentElementBuffer);
            const parsedJSON = JSON.parse(currentElementBuffer.slice(0,endIndex + 1));
            if (Node.isNode(parsedJSON)) {
              slateBody.push(parsedJSON);
  
              await updateReverie(supabase, cardId, { plate: slateBody, is_streaming:true });
  
              currentElementBuffer = "" + currentElementBuffer.slice(endIndex + 2);
            }
          } catch (err) {
            
            // console.warn('Incomplete JSON, buffering:', currentElementBuffer);
          }
        }
      }
    }
    
  } catch (err) {
    console.error('Error processing stream:', err);
    res.status(500).json({ message: 'Error processing stream:', err});
  }
}
await updateReverie(supabase, cardId, { is_streaming: false });
res.status(200);
// Final response
// res.status(200).json({ body: JSON.stringify(slateBody) });
// Close the JSON body array
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

//-----------------------------------------|                               |---------------------------------------------------------------------------
//                                         |     PROCESS META DATA         | 
//-----------------------------------------|_______________________________|---------------------------------------------------------------

  
  export async function processMetaData(cardId, inputData , intention, supabase, apiKey) {

    try {
      const metaRequest = {
        model: "gpt-4.1",
        stream: false,
        messages: [
          { role: "system", content: MetaAgent.insertSystemPrompt() },
          { role: "user", content: MetaAgent.insertUserPrompt(inputData , intention ) },
        ],
        response_format: MetaAgent.insertResponseFormat(),
        temperature: 0.4,
      };
  
      const metaResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        body: JSON.stringify(metaRequest),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      });
  
      if (!metaResponse.ok) {
        throw new Error(`HTTP error! status: ${metaResponse.status}`);
      }
  
      const metaData = JSON.parse((await metaResponse.json()).choices[0].message.content);
  
  
      const tagData = metaData.relatedtags;
      const tagIds = await addTags(supabase, tagData);


      const updatedCardData = {
        title: metaData.title,
        question: metaData.question,
      };

      await updateReverie(supabase, cardId, updatedCardData);


      return {
        updatedCardData,
        tags: tagIds,
      };
    } catch (error) {
      console.error('Error processing meta data:', error);
      throw error;
    }
  }

//-----------------------------------------|                               |---------------------------------------------------------------------------
//                                         |     GENERATE EMBEDDING        | 
//-----------------------------------------|_______________________________|---------------------------------------------------------------

  export async function generateEmbedding(apiKey, inputText) {
    const requestBody = {
      model: "text-embedding-3-large", // Recommended model for embeddings
      input: inputText
    };
  
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      });
  
      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(`API Error: ${response.statusText}, Details: ${JSON.stringify(errorDetails)}`);
      }
  
      const responseData = await response.json();
      const embedding = responseData.data[0].embedding.slice(0, 3072); // Slice if needed
      return { success: true, data: embedding };
    } catch (error) {
      console.error('Error generating embedding with fetch:', error);
      return { success: false, error: error.message };
    }
  }


//-----------------------------------------|                               |---------------------------------------------------------------------------
//                                         |     USER INSIGHT FLOW         | 
//-----------------------------------------|_______________________________|---------------------------------------------------------------
// generates a array of new user insights, gathers related insights, then determines whether to update them or create a new insight with the information.

export async function generateUserInsight(inputData, existingInsights, supabase, apiKey) { 


  const selectorRequest = {
    model: "gpt-4.1",
    stream: false,
    messages: [
      { role: "system", content: insightManager.selectorSystemPrompt() },
      { role: "user", content: insightManager.selectorUserPrompt( inputData, existingInsights )}
    ],
    response_format: insightManager.selectorResponseFormat(),
    temperature: 0.25
  };

  try {
    const selectorResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify(selectorRequest),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!selectorResponse.ok) {
      console.error('Selector Response Error:', await selectorResponse.text());
      throw new Error(`HTTP error! status: ${selectorResponse.status}`);
    }
    const selector = JSON.parse((await selectorResponse.json()).choices[0].message.content);
    const userInsights = selector.user_insights;
    // console.log(userInsights);
    if (Array.isArray(userInsights)) {

      for (const userInsight of userInsights) {
        const embedding = await generateEmbedding(apiKey, insightManager.categoryEmbeddingTags(userInsight.category) + userInsight?.insight);
      
        const associatedInsights = await retrieveUserInsights(supabase, embedding.data);

        const mergedData = [...new Map(
          [...associatedInsights.data, ...existingInsights.data].map(item => [item.id, item])
        ).values()];
       
        const insightsByCategory = mergedData.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item);
          return acc;
        }, {});
        // console.log("INPUT INSIGHTS BY CAT", insightsByCategory);
        if (!insightsByCategory[userInsight.category]) {
          insightsByCategory[userInsight.category] = [];
        }

        if (insightsByCategory && Object.keys(insightsByCategory).length > 0) {

          for (const category of Object.keys(insightsByCategory)) {

            const filteredInsights = insightsByCategory[category];

            if (filteredInsights && filteredInsights.length > 0) {

             

              const insightRequest = {
                model: 'gpt-4.1',
                stream: false,
                messages: [
                  { role: 'system', content: insightManager.updateSystemPrompt() },
                  { role: 'user', content: insightManager.updateUserPrompt( userInsight?.insight, filteredInsights ) },
                ],
                response_format: insightManager.updateResponseFormat(insightManager.categoryResponseFormat(category),filteredInsights.length),
                temperature: 0.25,
              };
              
              const insightResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                body: JSON.stringify(insightRequest),
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${apiKey}`,
                },
              });
        
              if (!insightResponse.ok) {
                console.error('Insight Response Error:', await insightResponse.text());
                throw new Error(`HTTP error! status: ${insightResponse.status}`);
              }
        
              const responseJson = await insightResponse.json();
              const processedInsights = JSON.parse(responseJson.choices[0].message.content);
              const insightUpdates = processedInsights.user_insights;

              // console.log(insightManager.updateUserPrompt( userInsight?.insight, filteredInsights ), "\n\n INSIGHT UPDATES : ", insightUpdates);

              // console.log("inisght updates", insightUpdates);
              if (insightUpdates.length > 0) {
                for (const updatedData of insightUpdates) {
                  const existingData = filteredInsights[updatedData.reference];
                  
                  // console.log('Seperate Data : \n\n UPDATES:\n', updatedData, "\n\n EXISTING:\n",existingData);
                  const mergedInsight = _.merge(
                    
                    JSON.parse(existingData?.insight),
                    {...updatedData?.insight}
                  );
                 
                 
                  const modifiedEmbedding = await generateEmbedding(apiKey, insightManager.categoryEmbeddingTags(category) + updatedData.retrieval_prompt);

                  await updateUserInsight(supabase, existingData.id, {
                    embedding: modifiedEmbedding.data,
                    retrieval_prompt: updatedData.retrieval_prompt,
                    insight:mergedInsight,
                  });
                  // console.log('Insight Updated : \n\n', updatedData.reference, mergedInsight);
                }
        
              }
            }  else if (category ===  userInsight.category){
              // console.log('No associated insights detected! CREATE:', userInsight.category, userInsight?.insight);
              await createNewInsight({
                supabase,
                insight: userInsight?.insight,
                category: userInsight.category,
                embedding,
                apiKey,
              });
            }
          }

        } else {

          // console.log('No associated insights detected! CREATE:', userInsight.category, userInsight?.insight);
          await createNewInsight({
            supabase,
            insight: userInsight?.insight,
            category: userInsight.category,
            embedding,
            apiKey,
          });
        }
      }

    } else {
      console.warn('userInsights is not an array:', userInsights);
    }

    return { success: true, insights: userInsights };

  } catch (error) {
    console.error('Error generating user insights:', error);
    return { success: false, error: error.message };
  }
}

//-----------------------------------------|                               |---------------------------------------------------------------------------
//                                         |     CREATE NEW INSIGHT        | 
//-----------------------------------------|_______________________________|---------------------------------------------------------------
// creates a new insight with given information

async function createNewInsight({ supabase, insight, category, embedding, apiKey }) {

  const insightRequest = {
    model: "gpt-4.1",
    stream: false,
    messages: [
      { role: "system", content: insightManager.createSystemPrompt() },
      { role: "user", content: JSON.stringify(insight) }
    ],
    response_format:insightManager.createResponseFormat(insightManager.categoryResponseFormat(category)),
    temperature: 0.25
  };

  const insightResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify(insightRequest),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!insightResponse.ok) {
    console.error('Insight Response Error:', await insightResponse.text());
    throw new Error(`HTTP error! status: ${insightResponse.status}`);
  }

  const generatedInsight = await insightResponse.json();
  const finalInsight = generatedInsight.choices[0].message.content;

  await addUserInsight(supabase, {
    insight: finalInsight, 
    category,
    retrieval_prompt:insight,
    embedding: embedding.data
  });
}
