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
    const { planId, paymentMethodId, customerName } = JSON.parse(event.body);

    // Validate required fields
    if (!paymentMethodId || !customerName) {
      throw new Error('Missing required fields: paymentMethodId and customerName');
    }

    // Validate required environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }

    console.log('Creating subscription for customer:', customerName);
    console.log('Using payment method ID:', paymentMethodId);

    // Create a customer
    const customer = await stripe.customers.create({
      name: customerName,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    console.log('Customer created:', customer.id);

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Create a product first
    const product = await stripe.products.create({
      name: 'Portfolio Tracker Premium',
      description: 'Unlimited holdings, advanced features, and priority support',
    });

    // Create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 999, // $9.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: price.id,
        },
      ],
      default_payment_method: paymentMethodId,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    console.log('Subscription created:', subscription.id);

    const paymentIntent = subscription.latest_invoice.payment_intent;
    
    // Check if payment requires additional action (3D Secure, etc.)
    if (paymentIntent.status === 'requires_action') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          requiresAction: true,
          paymentIntentClientSecret: paymentIntent.client_secret,
          subscriptionId: subscription.id,
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        subscriptionId: subscription.id,
        customerId: customer.id,
        status: subscription.status,
      }),
    };
  } catch (error) {
    console.error('Stripe error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: error.message || 'Payment processing failed',
        details: error.code || 'Unknown error',
        type: error.type || 'server_error'
      }),
    };
  }
};