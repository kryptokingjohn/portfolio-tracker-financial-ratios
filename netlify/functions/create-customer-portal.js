const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    console.log('Creating customer portal session...');
    console.log('Request body:', event.body);
    console.log('Has Stripe key:', !!process.env.STRIPE_SECRET_KEY);

    const { customerId } = JSON.parse(event.body);
    console.log('Customer ID:', customerId);

    if (!customerId) {
      throw new Error('Customer ID is required');
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }

    console.log('Creating billing portal session for customer:', customerId);

    // Create a customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${event.headers.origin || 'https://portfoliotrackerfinancialratios.com'}`,
    });

    console.log('Portal session created successfully:', session.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        url: session.url,
      }),
    };
  } catch (error) {
    console.error('Customer portal error:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode
    });
    
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: error.message || 'Failed to create customer portal session',
        type: error.type || 'unknown',
        code: error.code || 'unknown'
      }),
    };
  }
};