const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

exports.handler = async (event, context) => {
  const sig = event.headers['stripe-signature'];
  
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  console.log('Processing Stripe webhook:', stripeEvent.type);

  try {
    switch (stripeEvent.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeEvent.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object);
        break;
        
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(stripeEvent.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object);
        break;
        
      case 'setup_intent.succeeded':
        await handleSetupIntentSucceeded(stripeEvent.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
    
  } catch (error) {
    console.error('Webhook handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook handler failed' }),
    };
  }
};

async function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', subscription.id);
  
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  await updateUserSubscription(userId, {
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    plan_type: 'premium',
    status: subscription.status === 'trialing' ? 'trialing' : 'active',
    is_trialing: subscription.status === 'trialing',
    trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    billing_interval: subscription.metadata?.billingInterval || 'month',
    coupon_code: subscription.metadata?.couponCode || null,
    updated_at: new Date().toISOString(),
  });
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  const updates = {
    status: subscription.status,
    is_trialing: subscription.status === 'trialing',
    trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };

  // Clear grace period if subscription becomes active again
  if (subscription.status === 'active') {
    updates.grace_period_ends_at = null;
  }

  await updateUserSubscription(userId, updates);
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  await updateUserSubscription(userId, {
    status: 'cancelled',
    cancel_at_period_end: true,
    updated_at: new Date().toISOString(),
  });
}

async function handleTrialWillEnd(subscription) {
  console.log('Trial will end soon:', subscription.id);
  
  // TODO: Send email notification to user about trial ending
  // For now, just log it
  const trialEndDate = new Date(subscription.trial_end * 1000);
  console.log(`Trial ends on: ${trialEndDate.toISOString()}`);
}

async function handlePaymentFailed(invoice) {
  console.log('Payment failed for invoice:', invoice.id);
  
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Start 3-day grace period
  const { error } = await supabase.rpc('handle_failed_payment', {
    user_uuid: userId
  });

  if (error) {
    console.error('Failed to handle failed payment:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded for invoice:', invoice.id);
  
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  await updateUserSubscription(userId, {
    status: 'active',
    grace_period_ends_at: null, // Clear grace period
    updated_at: new Date().toISOString(),
  });
}

async function handleSetupIntentSucceeded(setupIntent) {
  console.log('Setup intent succeeded:', setupIntent.id);
  
  const subscriptionId = setupIntent.metadata?.subscription_id;
  const userId = setupIntent.metadata?.user_id;
  
  if (!subscriptionId || !userId) {
    console.error('Missing metadata in setup intent');
    return;
  }

  // Update subscription to use the new payment method
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    default_payment_method: setupIntent.payment_method,
  });

  console.log('Payment method attached to subscription:', subscription.id);
}

async function updateUserSubscription(userId, updates) {
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      ...updates
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Failed to update user subscription:', error);
    throw error;
  }

  console.log('User subscription updated successfully:', userId);
}