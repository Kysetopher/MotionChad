import Stripe from 'stripe';
import { ServerClient } from '../../../utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const supabase = ServerClient(req, res);

      // Get the user information from the session
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('Error fetching user:', userError);
        return res.status(401).json({ error: 'Failed to retrieve user.' });
      }

      if (!user) {
        console.error('User is not authenticated');
        return res.status(401).json({ error: 'User is not authenticated.' });
      }

      const userId = user.id;

      // Fetch the user's Stripe customer ID from the database
      const { data: userData, error: fetchError } = await supabase
        .from('user')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();

      if (fetchError || !userData.stripe_customer_id) {
        console.error('Error fetching stripe_customer_id:', fetchError);
        return res.status(400).json({ error: 'Stripe customer ID not found.' });
      }

      const stripeCustomerId = userData.stripe_customer_id;

      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [
          { price: process.env. STRIPE_MONTHLY_SUBSCRIPTION_PRICE_ID }, 
        ],
        expand: ['latest_invoice.payment_intent'],
      });

      // Respond with the subscription details
      res.status(200).json({
        message: 'Subscription created successfully',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          latest_invoice: subscription.latest_invoice.payment_intent,
        },
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}