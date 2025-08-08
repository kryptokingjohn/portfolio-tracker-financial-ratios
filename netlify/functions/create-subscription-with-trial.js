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
    const { 
      priceId, 
      customerEmail, 
      userId, 
      billingInterval = 'month',
      couponCode,
      returnUrl 
    } = JSON.parse(event.body);

    if (!priceId || !customerEmail || !userId) {
      throw new Error('Missing required fields: priceId, customerEmail, userId');
    }

    console.log('Creating subscription with trial:', {
      priceId,
      customerEmail,
      userId,
      billingInterval,
      couponCode: couponCode ? 'provided' : 'none'
    });

    // Create or retrieve customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log('Found existing customer:', customer.id);
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          userId: userId,
        },
      });
      console.log('Created new customer:', customer.id);
    }

    // Create subscription with 30-day trial
    const subscriptionData = {
      customer: customer.id,
      items: [{ price: priceId }],
      trial_period_days: 30,
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: userId,
        billingInterval: billingInterval,
        couponCode: couponCode || '',
      },
    };

    // Add coupon if provided
    if (couponCode) {
      try {
        // Verify coupon exists and is valid
        const coupon = await stripe.coupons.retrieve(couponCode);
        console.log('Applying coupon:', coupon.id);
        subscriptionData.coupon = couponCode;
      } catch (couponError) {
        console.warn('Invalid coupon code:', couponCode, couponError.message);
        // Continue without coupon rather than failing
      }
    }

    const subscription = await stripe.subscriptions.create(subscriptionData);
    
    console.log('Subscription created with trial:', subscription.id);
    
    // Create Checkout Session for payment method collection
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'setup',
      setup_intent_data: {
        metadata: {
          subscription_id: subscription.id,
          user_id: userId,
        },
      },
      success_url: `${returnUrl || process.env.SITE_URL}?session_id={CHECKOUT_SESSION_ID}&setup=success`,
      cancel_url: `${returnUrl || process.env.SITE_URL}?setup=cancelled`,
      metadata: {
        subscription_id: subscription.id,
        user_id: userId,
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        subscriptionId: subscription.id,
        customerId: customer.id,
        clientSecret: subscription.latest_invoice.payment_intent?.client_secret,
        checkoutUrl: checkoutSession.url,
        trialEnd: subscription.trial_end,
      }),
    };

  } catch (error) {
    console.error('Subscription creation error:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: error.message || 'Failed to create subscription',
        type: error.type || 'unknown',
      }),
    };
  }
};