const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { planId, paymentMethod } = JSON.parse(event.body);

    // Validate required environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }

    // Create a payment method
    const stripePaymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: paymentMethod.card.number,
        exp_month: paymentMethod.card.exp_month,
        exp_year: paymentMethod.card.exp_year,
        cvc: paymentMethod.card.cvc,
      },
      billing_details: paymentMethod.billing_details,
    });

    // Create a customer
    const customer = await stripe.customers.create({
      name: paymentMethod.billing_details.name,
      payment_method: stripePaymentMethod.id,
      invoice_settings: {
        default_payment_method: stripePaymentMethod.id,
      },
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Portfolio Tracker Premium',
              description: 'Unlimited holdings, advanced features, and priority support',
            },
            unit_amount: 999, // $9.99 in cents
            recurring: {
              interval: 'month',
            },
          },
        },
      ],
      default_payment_method: stripePaymentMethod.id,
      expand: ['latest_invoice.payment_intent'],
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        subscriptionId: subscription.id,
        customerId: customer.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      }),
    };
  } catch (error) {
    console.error('Stripe error:', error);
    
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: error.message || 'Payment processing failed',
      }),
    };
  }
};