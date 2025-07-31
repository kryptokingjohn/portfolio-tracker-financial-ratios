#!/usr/bin/env node

/**
 * Basic script to populate companies table with essential S&P 500 data
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://oxxcykrriyrqzesamvxv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eGN5a3JyaXlycXplc2Ftdnh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMzE4MDcsImV4cCI6MjA2ODYwNzgwN30.GsO-rFvtAoBeQHaOGWTnK8yH2SvHxPesbaqHq-v_pBU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Top S&P 500 companies
const companies = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Information Technology', industry: 'Technology Hardware, Storage & Peripherals' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Information Technology', industry: 'Systems Software' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Communication Services', industry: 'Interactive Media & Services' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary', industry: 'Internet & Direct Marketing Retail' },
  { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary', industry: 'Automobile Manufacturers' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Information Technology', industry: 'Semiconductors' },
  { ticker: 'META', name: 'Meta Platforms Inc.', sector: 'Communication Services', industry: 'Interactive Media & Services' },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway Inc.', sector: 'Financials', industry: 'Multi-Sector Holdings' },
  { ticker: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Health Care', industry: 'Managed Health Care' },
  { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Health Care', industry: 'Pharmaceuticals' }
];

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function main() {
  console.log('🚀 Starting companies population...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const company of companies) {
    const companyData = {
      id: generateUUID(),
      ticker: company.ticker,
      company_name: company.name,
      sector: company.sector,
      industry: company.industry,
      asset_type: 'stocks',
      exchange: 'NYSE/NASDAQ',
      currency: 'USD',
      description: `${company.name} is a leading company in the ${company.sector} sector.`
    };
    
    console.log(`Inserting ${company.ticker}...`);
    
    const { data, error } = await supabase
      .from('companies')
      .upsert(companyData, { onConflict: 'ticker' })
      .select();
    
    if (error) {
      console.error(`❌ Error inserting ${company.ticker}:`, error.message);
      errorCount++;
    } else {
      console.log(`✅ Successfully inserted ${company.ticker}: ${company.name}`);
      successCount++;
    }
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\n📊 Results: ${successCount} successful, ${errorCount} failed`);
  
  // Check final count
  const { data: allCompanies, error: countError } = await supabase
    .from('companies')
    .select('ticker, company_name')
    .order('ticker');
  
  if (!countError && allCompanies) {
    console.log(`\n📋 Total companies in database: ${allCompanies.length}`);
    allCompanies.forEach(comp => {
      console.log(`  ${comp.ticker}: ${comp.company_name}`);
    });
  }
}

main().catch(console.error);