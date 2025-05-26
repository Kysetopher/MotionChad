
import { ServerClient } from '../../../utils/supabase/server';
import limiter from '../../../utils/rateLimiter';
import { InputNewAgentStream, generateEmbedding } from '../../../utils/supabase/process';
import { retrieveUserInsights } from '../../../utils/supabase/functions';
import Stripe from 'stripe';

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

  if (userError || !user) { return res.status(401).json({ error: 'User is not authenticated.' }); }

  const userId = user.id;

// -----------------------------------------| Stripe Validation and Rate Limiting |---------------------------------------------------------------
  
  const { data: userData, error: fetchError } = await supabase
    .from('user')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();


// -----------------------------------------| Retrieve insights and send to card creation process |---------------------------------------------------------------
 
const { inputData } = req.body;

  const embeddingResult = await generateEmbedding( process.env.OPENAI_API_KEY, inputData.userinput);
  const userInsights = await retrieveUserInsights(supabase, embeddingResult.data);

  req.body.inputData = inputData;
  req.body.userInsights = userInsights;

  if (fetchError || !userData.stripe_customer_id) {
    limiter(req, res, async () => {
      await InputNewAgentStream(req, res, supabase, process.env.OPENAI_API_KEY);
    });
    return;
  }

  const stripeCustomerId = userData.stripe_customer_id;
  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: 'active',
  });

  if (subscriptions.data.length > 0) {
    return InputNewAgentStream(req, res, supabase, process.env.OPENAI_API_KEY);
  }

  limiter(req, res, async () => {
    await InputNewAgentStream(req, res, supabase, process.env.OPENAI_API_KEY);
  });
}