const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
    const customerId = event.queryStringParameters?.customerId;

    if (!customerId) {
      throw new Error('Customer ID is required');
    }

    // Get customer details
    const customer = await stripe.customers.retrieve(customerId);
    
    // Get subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 10,
    });

    // Get payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    // Get recent invoices
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10,
    });

    const subscriptionData = subscriptions.data[0];
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
        },
        subscription: subscriptionData ? {
          id: subscriptionData.id,
          status: subscriptionData.status,
          currentPeriodEnd: subscriptionData.current_period_end,
          currentPeriodStart: subscriptionData.current_period_start,
          cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
          priceId: subscriptionData.items.data[0]?.price?.id,
          amount: subscriptionData.items.data[0]?.price?.unit_amount,
          currency: subscriptionData.items.data[0]?.price?.currency,
          interval: subscriptionData.items.data[0]?.price?.recurring?.interval,
        } : null,
        paymentMethods: paymentMethods.data.map(pm => ({
          id: pm.id,
          brand: pm.card?.brand,
          last4: pm.card?.last4,
          expMonth: pm.card?.exp_month,
          expYear: pm.card?.exp_year,
        })),
        invoices: invoices.data.map(invoice => ({
          id: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: invoice.status,
          created: invoice.created,
          hostedInvoiceUrl: invoice.hosted_invoice_url,
          invoicePdf: invoice.invoice_pdf,
        })),
      }),
    };
  } catch (error) {
    console.error('Get subscription details error:', error);
    
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: error.message || 'Failed to get subscription details',
      }),
    };
  }
};