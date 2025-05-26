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

      // Get the Stripe customer
      const { data: userData, error: userDataError } = await supabase
        .from('user')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();

      if (userDataError || !userData.stripe_customer_id) {
        console.error('Error fetching stripe_customer_id:', userDataError);
        return res.status(404).json({ error: 'Stripe customer ID not found for user.' });
      }

      const customerId = userData.stripe_customer_id;

      // Get the customer's default payment method
      const customer = await stripe.customers.retrieve(customerId);
      const paymentMethodId = customer.invoice_settings.default_payment_method;

      if (!paymentMethodId) {
        return res.status(400).json({ error: 'No default payment method found for the customer.' });
      }

      // Detach the payment method from the customer
      const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);

      // Respond with success
      res.status(200).json({ success: true, paymentMethod });
    } catch (error) {
      console.error('Error during Stripe API call:', error);
      res.status(400).json({ error: { message: error.message } });
    }
  } else {
    res.setHeader('Allow', 'DELETE');
    res.status(405).end('Method Not Allowed');
  }
}
