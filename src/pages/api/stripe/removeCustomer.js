import Stripe from 'stripe';
import { ServerClient } from '../../../utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
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

      // Cancel all subscriptions for the customer
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'active',
      });

      for (const subscription of subscriptions.data) {
        await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: true });
        console.log(`Subscription ${subscription.id} canceled.`);
      }

      // Delete the customer from Stripe
      await stripe.customers.del(stripeCustomerId);
      console.log(`Customer ${stripeCustomerId} deleted from Stripe.`);

      // Update the user in the database to remove stripe_customer_id
      const { data: updatedUser, error: updateError } = await supabase
        .from('user')
        .update({ stripe_customer_id: null })
        .eq('id', userId)
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        return res.status(500).json({ error: 'Failed to update user record.' });
      }

      console.log(`User ${userId} updated, stripe_customer_id removed.`);

      // Respond with success message
      res.status(200).json({ message: 'Customer ID removed and subscriptions canceled.' });
    } catch (error) {
      console.error('Error during Stripe API call:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'DELETE');
    res.status(405).end('Method Not Allowed');
  }
}