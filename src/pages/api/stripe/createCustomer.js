import Stripe from 'stripe';
import { ServerClient } from '../../../utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { paymentMethodId, customerEmail } = req.body;

    console.log('Received request body:', req.body);

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

      // Create Stripe customer
      const customer = await stripe.customers.create({
        payment_method: paymentMethodId,
        email: customerEmail,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      console.log('Customer created:', customer);

      // Update the user in the database with the stripe_customer_id
      const { data: updatedUser, error: updateError } = await supabase
        .from('user')
        .update({ stripe_customer_id: customer.id })
        .eq('id', userId)
        .single();

      if (updateError) {
        console.error('Error updating user with stripe_customer_id:', updateError);
        return res.status(500).json({ error: 'Error updating user with stripe_customer_id.' });
      }

      console.log('User updated with stripe_customer_id:', updatedUser);

      // Create Stripe subscription
      console.log('Creating subscription for customer ID:', customer.id);
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          { price: process.env. STRIPE_MONTHLY_SUBSCRIPTION_PRICE_ID },
        ],
        expand: ['latest_invoice.payment_intent'],
      });

      console.log('Subscription created:', subscription);

      res.status(200).json({ subscriptionId: subscription.id });
    } catch (error) {
      console.error('Error during Stripe API call:', error);
      res.status(400).json({ error: { message: error.message } });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}