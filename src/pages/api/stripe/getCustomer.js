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

      // Fetch the customer's Stripe account information
      const customer = await stripe.customers.retrieve(stripeCustomerId);

      // Fetch the customer's active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'active',
      });

      // Fetch the customer's default payment method
      const paymentMethods = await stripe.paymentMethods.list({
        customer: stripeCustomerId,
        type: 'card',
      });
      const defaultPaymentMethod = customer.invoice_settings.default_payment_method;
      const defaultPaymentMethodDetails = paymentMethods.data.find(
        (method) => method.id === defaultPaymentMethod
      );

      // Structure the response
      const response = {
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          balance: customer.balance,
        },
        subscriptions: subscriptions.data.map((subscription) => ({
          id: subscription.id,
          status: subscription.status,
          start_date: subscription.start_date,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          items: subscription.items.data.map((item) => ({
            price: item.price.unit_amount / 100,
            currency: item.price.currency,
            product: item.price.product,
          })),
        })),
        default_payment_method: defaultPaymentMethodDetails ? {
          id: defaultPaymentMethodDetails.id,
          brand: defaultPaymentMethodDetails.card.brand,
          last4: defaultPaymentMethodDetails.card.last4,
          exp_month: defaultPaymentMethodDetails.card.exp_month,
          exp_year: defaultPaymentMethodDetails.card.exp_year,
        } : null,
      };

      // Respond with the customer and subscription information
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
