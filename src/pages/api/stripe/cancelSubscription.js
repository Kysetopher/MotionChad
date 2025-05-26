const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { subscriptionId } = req.body;

    try {
      // Cancel the subscription
      const subscription = await stripe.subscriptions.cancel(subscriptionId);

      // Respond with success
      res.status(200).json({ success: true, subscription });
    } catch (error) {
      // Handle any errors
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    // Handle unsupported methods
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}