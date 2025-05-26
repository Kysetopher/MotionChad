import Stripe from 'stripe';
import { ServerClient } from '../../../utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
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

      // Fetch the customer's payment methods
      const paymentMethods = await stripe.paymentMethods.list({
        customer: stripeCustomerId,
        type: 'card',
      });

      // Adding 'expired' parameter to each payment method
      const currentDate = new Date();
      const paymentMethodsWithExpiry = paymentMethods.data.map((method) => {
        const expDate = new Date(method.exp_year, method.exp_month - 1);
        return {
          id: method.id,
          brand: method.card.brand,
          last4: method.card.last4,
          exp_month: method.card.exp_month,
          exp_year: method.card.exp_year,
          expired: currentDate > expDate,
        };
      });

      // Structure the response
      const response = {
        paymentMethods: paymentMethodsWithExpiry,
      };

      // Respond with the payment methods
      res.status(200).json(response);
    } catch (error) {
      console.error('Error during Stripe API call:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
  }
}
