import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

export default async function handler(req, res) {
  const { subscriptionId, updates } = req.body; // Expect dynamic updates in the request

  if (req.method === 'POST') {
    try {
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, updates);
      console.log('Subscription updated successfully:', updatedSubscription);
      res.status(200).json({ subscription: updatedSubscription });
    } catch (error) {
      console.error('Error updating subscription:', error);
      res.status(500).json({ error: 'Failed to update subscription' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}