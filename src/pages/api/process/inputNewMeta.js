import { processMetaData } from '../../../utils/supabase/process';
import { ServerClient } from '../../../utils/supabase/server';
import Stripe from 'stripe';
import limiter from '../../../utils/rateLimiter';

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
    return limiter(req, res, async () => {
      const apiKey = process.env.OPENAI_API_KEY;
      const result = await processMetaData(req, res, supabase, apiKey);

      // Return the result to the client
      res.status(200).json({
        ...result.updatedCardData
      });
    });
  }

  const stripeCustomerId = userData.stripe_customer_id;
  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: 'active',
  });

  const apiKey = process.env.OPENAI_API_KEY;

  if (subscriptions.data.length > 0) {
    const result = await processMetaData(req, res, supabase, apiKey);

    // Return the result to the client
    return res.status(200).json({
      ...result.updatedCardData,
      tags: result.tags,
      score: null,
      userinsights: result.userinsights,
    });
  }

  limiter(req, res, async () => {
    const result = await processMetaData(req, res, supabase, apiKey);

    // Return the result to the client
    res.status(200).json({
      ...result.updatedCardData,
      tags: result.tags,
      score: null,
      userinsights: result.userinsights,
    });
  });
}
