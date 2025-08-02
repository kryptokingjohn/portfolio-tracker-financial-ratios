exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Check if environment variables are set
    const hasStripeSecret = !!process.env.STRIPE_SECRET_KEY;
    const stripeKeyPrefix = process.env.STRIPE_SECRET_KEY ? 
      process.env.STRIPE_SECRET_KEY.substring(0, 7) + '...' : 'Not set';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        stripeConfigured: hasStripeSecret,
        keyPrefix: stripeKeyPrefix,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};