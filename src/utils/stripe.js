/// FILE — src/utils/stripe.js
/// PURPOSE — Provides a configured Stripe instance for use throughout the application, enabling secure interaction with the Stripe API for payment processing and related operations. This module centralizes Stripe initialization using the secret API key from environment variables, ensuring consistent and secure access to Stripe services.

import Stripe from 'stripe';

// Create and configure a Stripe instance using the secret API key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Export the configured Stripe instance for use in other modules
export default stripe;