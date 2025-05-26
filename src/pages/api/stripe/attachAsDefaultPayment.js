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
      const { paymentMethodId, customerEmail } = req.body;

      if (!paymentMethodId) {
        return res.status(400).json({ error: 'Payment method ID is required.' });
      }

      // Attach the new payment method to the customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId,
      });

      // Update the default payment method and customer email
      await stripe.customers.update(stripeCustomerId, {
        email: customerEmail,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      res.status(200).json({ message: 'Payment method and email updated successfully.' });
    } catch (error) {
      console.error('Error during Stripe API call:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
