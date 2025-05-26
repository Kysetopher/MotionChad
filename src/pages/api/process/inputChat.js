import { addChat, addCard, addEmbedding, retrieveUserInsights, getRecentAgentChatHistory } from '../../../utils/supabase/functions';
import { ServerClient } from '../../../utils/supabase/server';
import Stripe from 'stripe';
import limiter from '../../../utils/rateLimiter';
import Spells from '../../../utils/spells/chatAgents';
import chatSelector from '../../../utils/spells/chatSelector';
import {  generateUserInsight, generateEmbedding } from '../../../utils/supabase/process';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

function GetAssistantResponse(resp) {
  const msg = resp.output.find(
    item =>
      item.type   === 'message' &&
      item.role   === 'assistant' &&
      item.status === 'completed'
  );
  if (!msg) {
    throw new Error('No completed assistant message in response.');
  }

  const textPart = msg.content.find(part => part.type === 'output_text');
  if (!textPart) {
    throw new Error('Assistant message contains no output_text part.');
  }

  return JSON.parse(textPart.text);
}

//-----------------------------------------|                                  |---------------------------------------------------------------------------
//                                         | ENDPOINT ENTRANCE AND VALIDATION | 
//-----------------------------------------|__________________________________|---------------------------------------------------------------

export default async function handler(req, res) {

// -----------------------------------------| Supabase Authentication |--------------------------------------------------------------------------
 
  const supabase = ServerClient(req, res);
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return res.status(401).json({ error: 'User is not authenticated.' });
  }

  const userId = user.id;

// -----------------------------------------| Stripe Validation and Rate Limiting |---------------------------------------------------------------

  const { data: userData, error: fetchError } = await supabase
    .from('user')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (fetchError || !userData.stripe_customer_id) {
    limiter(req, res, async () => {
      await processRequest(req, res);
    });
    return;
  }

  const stripeCustomerId = userData.stripe_customer_id;

  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: 'active',
  });

  if (subscriptions.data.length > 0) {
    return processRequest(req, res);
  }

  limiter(req, res, async () => {
    await processRequest(req, res);
  });
}

//-----------------------------------------|                               |---------------------------------------------------------------------------
//                                         |      PROCESS REQUEST LOGIC    | 
//-----------------------------------------|_______________________________|---------------------------------------------------------------

async function processRequest(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { inputData } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;
  const supabase = ServerClient(req, res);

  try {
    await addChat(supabase, { text: inputData, user: true, viewed:true });

    const embeddingResult = await generateEmbedding(apiKey, inputData);
    const chatHistory = await getRecentAgentChatHistory(supabase);
    const userInsights = await retrieveUserInsights(supabase, embeddingResult.data);

    const agentRequest = {
      model: "gpt-4.1",
      stream: false,
      messages: [
        { role: "system", content:  chatSelector.systemPrompt() },
        { role: "user", content: chatSelector.userPrompt(inputData, chatHistory, userInsights)}
      ],
      response_format: chatSelector.responseFormat(),
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

    if (!agentResponse.ok) { throw new Error(`HTTP error! status: ${agentResponse.status}`); }
 
    const agentJson = await agentResponse.json();
    const agentmessage = agentJson.choices[0].message.content;
    const selector = JSON.parse(agentmessage);

    // console.log("AGENT :\n\n", selector.selected_agent );
    const result = await handleSelectedAgent(req, res, supabase, apiKey, selector, userInsights,chatHistory);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error processing input:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

//-----------------------------------------|                               |---------------------------------------------------------------------------
//                                         |      HANDLE SELECTED AGENT    | 
//-----------------------------------------|_______________________________|---------------------------------------------------------------

async function handleSelectedAgent(req, res, supabase, apiKey, selector, userInsights , chatHistory) {
  
  const { inputData } = req.body;

  // console.log(chatSelector.textSuggestionuUserPrompt(inputData, selector.intention, chatHistory, userInsights));

  const chatRequest = {
    model: selector.selected_agent === "web_crawler" ? "gpt-4.1-mini": "gpt-4.1",
    input: [
      { role: "system", content: chatSelector.textSuggestionSystemPrompt(Spells[selector.selected_agent]())},
      { role: "user", content: chatSelector.textSuggestionuUserPrompt(inputData, selector.intention, chatHistory, userInsights)},
    ],
    text: {
      format: chatSelector.textSuggestionFormat(),
    },
    tools: selector.selected_agent === "web_crawler"
      ? [{
          type: "web_search_preview",  
          user_location: { type: "approximate" },
          search_context_size: "low"
        }]
      : [],
    temperature        : 0.4,
    top_p              : 1,
    max_output_tokens  : 10000,
  };

  const chatResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    body: JSON.stringify(chatRequest),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!chatResponse.ok) {
    throw new Error(`HTTP error! status: ${chatResponse.status}`);
  }
 
  const responseJson = await chatResponse.json(); 
  const chatdata = GetAssistantResponse(responseJson);
  generateUserInsight(inputData, userInsights, supabase, apiKey);

  const embeddingResult = await generateEmbedding(apiKey, selector.retrieval_prompt);
  await addChat(supabase, { text: chatdata.text_response, user: false, suggestions:chatdata.suggestions,  clarification: (chatdata.clarification==="true" ) , embedding: embeddingResult.data});
  return chatdata.suggestions;
  
}