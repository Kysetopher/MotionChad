import { updateChat, addEmbedding, retrieveUserInsights, getRecentAgentChatHistory } from '../../../utils/supabase/functions';
import { ServerClient } from '../../../utils/supabase/server';
import Stripe from 'stripe';
import limiter from '../../../utils/rateLimiter';
import Spells from '../../../utils/spells/chatAgents';
import chatSelector from '../../../utils/spells/chatSelector';
import { InputNewAgentStream , generateUserInsight, generateEmbedding } from '../../../utils/supabase/process';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});
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

  const { inputData, chatId } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;
  const supabase = ServerClient(req, res);

  try {


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


    console.log("AGENT :\n\n", selector.selected_agent );
    const result = await handleSelectedAgent(req, res, supabase, apiKey, selector.selected_agent, userInsights, chatHistory);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error processing input:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

//-----------------------------------------|                               |---------------------------------------------------------------------------
//                                         |      HANDLE SELECTED AGENT    | 
//-----------------------------------------|_______________________________|---------------------------------------------------------------

async function handleSelectedAgent(req, res, supabase, apiKey, selectedAgent, userInsights , chatHistory) {

    const { inputData, chatId } = req.body;

    const chatRequest = {
      model: "gpt-4.1",
      stream: false,
      messages: [
        { role: "system", content: chatSelector.textSuggestionSystemPrompt(Spells[selectedAgent]())},
        { role: "user", content: chatSelector.moreOptionUserPrompt(inputData, chatHistory, userInsights)},
      ],
      response_format: chatSelector.textSuggestionFormat(),
      temperature: 0.4,
    };
    console.log( chatSelector.userPrompt(inputData, chatHistory, userInsights));
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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

    const chatdata = JSON.parse((await chatResponse.json()).choices[0].message.content);
    console.log(chatdata);
    
    generateUserInsight(inputData, userInsights, supabase, apiKey);


    await updateChat(supabase, chatId, { suggestions:chatdata.suggestions });
    return chatdata.suggestions;
}