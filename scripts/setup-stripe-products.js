// Script to set up Stripe products and coupons for the subscription system
// Run this script with: node scripts/setup-stripe-products.js

import Stripe from 'stripe';

async function createStripeProducts() {
  try {
    console.log('🚀 Setting up Stripe products and coupons...');
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('⚠️  STRIPE_SECRET_KEY not found in environment variables');
      console.log('📋 This script would create the following products in Stripe:');
      console.log('');
      console.log('🎯 Products:');
      console.log('   - Premium Monthly: $9.99/month');
      console.log('   - Premium Annual: $95.90/year (20% off)');
      console.log('');
      console.log('🎟️  Discount Coupons:');
      console.log('   - SAVE50: 50% off first 3 months (20 uses)');
      console.log('   - SAVE25: 25% off first 3 months (20 uses)');  
      console.log('   - FREEYEAR: 100% off for 12 months (20 uses)');
      console.log('   - FREEMONTH: 100% off for 1 month (20 uses)');
      console.log('');
      console.log('🔧 To run this script with actual Stripe integration:');
      console.log('   1. Set STRIPE_SECRET_KEY in your environment');
      console.log('   2. Run: node scripts/setup-stripe-products.js');
      console.log('   3. Update .env with the returned price IDs');
      return;
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Create Premium product
    const premiumProduct = await stripe.products.create({
      name: 'Portfolio Tracker Premium',
      description: 'Advanced portfolio tracking with comprehensive financial ratios and analytics',
      type: 'service',
    });
    console.log('✅ Created Premium product:', premiumProduct.id);

    // Create Monthly Premium price
    const monthlyPrice = await stripe.prices.create({
      unit_amount: 999, // $9.99
      currency: 'usd',
      recurring: { interval: 'month' },
      product: premiumProduct.id,
      nickname: 'Premium Monthly',
    });
    console.log('✅ Created Monthly price:', monthlyPrice.id);

    // Create Annual Premium price (20% discount)
    const annualPrice = await stripe.prices.create({
      unit_amount: 9590, // $95.90 (20% off $119.88)
      currency: 'usd',
      recurring: { interval: 'year' },
      product: premiumProduct.id,
      nickname: 'Premium Annual (20% off)',
    });
    console.log('✅ Created Annual price:', annualPrice.id);

    // Create coupons
    const coupons = [
      {
        id: 'SAVE50',
        name: '50% Off First 3 Months',
        percent_off: 50,
        duration: 'repeating',
        duration_in_months: 3,
        max_redemptions: 20,
      },
      {
        id: 'SAVE25', 
        name: '25% Off First 3 Months',
        percent_off: 25,
        duration: 'repeating',
        duration_in_months: 3,
        max_redemptions: 20,
      },
      {
        id: 'FREEYEAR',
        name: '12 Months Free',
        percent_off: 100,
        duration: 'repeating',
        duration_in_months: 12,
        max_redemptions: 20,
      },
      {
        id: 'FREEMONTH',
        name: '1 Month Free',
        percent_off: 100,
        duration: 'repeating',
        duration_in_months: 1,
        max_redemptions: 20,
      },
    ];

    console.log('🎟️ Creating discount coupons...');
    for (const couponData of coupons) {
      const coupon = await stripe.coupons.create(couponData);
      console.log(`✅ Created coupon ${coupon.id}: ${couponData.name}`);
    }

    console.log('🎉 Setup complete! Update your .env file with:');
    console.log(`VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID=${monthlyPrice.id}`);
    console.log(`VITE_STRIPE_PREMIUM_ANNUAL_PRICE_ID=${annualPrice.id}`);
    console.log(`VITE_STRIPE_PREMIUM_PRODUCT_ID=${premiumProduct.id}`);

  } catch (error) {
    console.error('❌ Error setting up Stripe products:', error);
  }
}

createStripeProducts();