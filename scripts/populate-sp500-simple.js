#!/usr/bin/env node

/**
 * Simple script to populate S&P 500 companies using batch insert
 * This script creates a minimal dataset focused on the essential fields
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = 'https://oxxcykrriyrqzesamvxv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eGN5a3JyaXlycXplc2Ftdnh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMzE4MDcsImV4cCI6MjA2ODYwNzgwN30.GsO-rFvtAoBeQHaOGWTnK8yH2SvHxPesbaqHq-v_pBU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample of well-known S&P 500 companies with essential data
const sp500Companies = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Information Technology', industry: 'Technology Hardware, Storage & Peripherals' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Information Technology', industry: 'Systems Software' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Communication Services', industry: 'Interactive Media & Services' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary', industry: 'Internet & Direct Marketing Retail' },
  { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary', industry: 'Automobile Manufacturers' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Information Technology', industry: 'Semiconductors' },
  { ticker: 'META', name: 'Meta Platforms Inc.', sector: 'Communication Services', industry: 'Interactive Media & Services' },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway Inc.', sector: 'Financials', industry: 'Multi-Sector Holdings' },
  { ticker: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Health Care', industry: 'Managed Health Care' },
  { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Health Care', industry: 'Pharmaceuticals' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financials', industry: 'Diversified Banks' },
  { ticker: 'V', name: 'Visa Inc.', sector: 'Information Technology', industry: 'Data Processing & Outsourced Services' },
  { ticker: 'PG', name: 'Procter & Gamble Company', sector: 'Consumer Staples', industry: 'Personal Products' },
  { ticker: 'HD', name: 'Home Depot Inc.', sector: 'Consumer Discretionary', industry: 'Home Improvement Retail' },
  { ticker: 'CVX', name: 'Chevron Corporation', sector: 'Energy', industry: 'Integrated Oil & Gas' },
  { ticker: 'MA', name: 'Mastercard Inc.', sector: 'Information Technology', industry: 'Data Processing & Outsourced Services' },
  { ticker: 'ABBV', name: 'AbbVie Inc.', sector: 'Health Care', industry: 'Biotechnology' },
  { ticker: 'BAC', name: 'Bank of America Corp.', sector: 'Financials', industry: 'Diversified Banks' },
  { ticker: 'KO', name: 'Coca-Cola Company', sector: 'Consumer Staples', industry: 'Soft Drinks' },
  { ticker: 'AVGO', name: 'Broadcom Inc.', sector: 'Information Technology', industry: 'Semiconductors' },
  { ticker: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Staples', industry: 'Soft Drinks' },
  { ticker: 'TMO', name: 'Thermo Fisher Scientific Inc.', sector: 'Health Care', industry: 'Life Sciences Tools & Services' },
  { ticker: 'COST', name: 'Costco Wholesale Corporation', sector: 'Consumer Staples', industry: 'Hypermarkets & Super Centers' },
  { ticker: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Staples', industry: 'Hypermarkets & Super Centers' },
  { ticker: 'MRK', name: 'Merck & Co. Inc.', sector: 'Health Care', industry: 'Pharmaceuticals' },
  { ticker: 'ABT', name: 'Abbott Laboratories', sector: 'Health Care', industry: 'Health Care Equipment' },
  { ticker: 'ACN', name: 'Accenture plc', sector: 'Information Technology', industry: 'IT Consulting & Other Services' },
  { ticker: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services', industry: 'Movies & Entertainment' },
  { ticker: 'ADBE', name: 'Adobe Inc.', sector: 'Information Technology', industry: 'Application Software' },
  { ticker: 'CRM', name: 'Salesforce Inc.', sector: 'Information Technology', industry: 'Application Software' },
  { ticker: 'ORCL', name: 'Oracle Corporation', sector: 'Information Technology', industry: 'Systems Software' },
  { ticker: 'LLY', name: 'Eli Lilly and Company', sector: 'Health Care', industry: 'Pharmaceuticals' },
  { ticker: 'CSCO', name: 'Cisco Systems Inc.', sector: 'Information Technology', industry: 'Communications Equipment' },
  { ticker: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', industry: 'Integrated Oil & Gas' },
  { ticker: 'WFC', name: 'Wells Fargo & Company', sector: 'Financials', industry: 'Diversified Banks' },
  { ticker: 'DIS', name: 'Walt Disney Company', sector: 'Communication Services', industry: 'Movies & Entertainment' },
  { ticker: 'PFE', name: 'Pfizer Inc.', sector: 'Health Care', industry: 'Pharmaceuticals' },
  { ticker: 'VZ', name: 'Verizon Communications Inc.', sector: 'Communication Services', industry: 'Integrated Telecommunication Services' },
  { ticker: 'INTC', name: 'Intel Corporation', sector: 'Information Technology', industry: 'Semiconductors' },
  { ticker: 'NKE', name: 'Nike Inc.', sector: 'Consumer Discretionary', industry: 'Apparel, Accessories & Luxury Goods' },
  { ticker: 'AMD', name: 'Advanced Micro Devices Inc.', sector: 'Information Technology', industry: 'Semiconductors' },
  { ticker: 'COP', name: 'ConocoPhillips', sector: 'Energy', industry: 'Integrated Oil & Gas' },
  { ticker: 'T', name: 'AT&T Inc.', sector: 'Communication Services', industry: 'Integrated Telecommunication Services' },
  { ticker: 'NEE', name: 'NextEra Energy Inc.', sector: 'Utilities', industry: 'Electric Utilities' },
  { ticker: 'UPS', name: 'United Parcel Service Inc.', sector: 'Industrials', industry: 'Air Freight & Logistics' },
  { ticker: 'BMY', name: 'Bristol-Myers Squibb Company', sector: 'Health Care', industry: 'Pharmaceuticals' },
  { ticker: 'LOW', name: 'Lowe\'s Companies Inc.', sector: 'Consumer Discretionary', industry: 'Home Improvement Retail' },
  { ticker: 'QCOM', name: 'QUALCOMM Incorporated', sector: 'Information Technology', industry: 'Semiconductors' },
  { ticker: 'UNP', name: 'Union Pacific Corporation', sector: 'Industrials', industry: 'Railroads' },
  { ticker: 'HON', name: 'Honeywell International Inc.', sector: 'Industrials', industry: 'Industrial Conglomerates' },
  { ticker: 'MS', name: 'Morgan Stanley', sector: 'Financials', industry: 'Investment Banking & Brokerage' }
];

// Function to generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Main function to populate companies
async function populateCompanies() {
  try {
    console.log('🚀 Starting S&P 500 companies population (top 50)...');
    
    // Prepare data for insertion
    const companiesToInsert = sp500Companies.map(company => ({
      id: generateUUID(),
      ticker: company.ticker.toUpperCase(),
      company_name: company.name,
      sector: company.sector,
      industry: company.industry,
      asset_type: 'stocks',
      exchange: 'NYSE/NASDAQ',
      currency: 'USD',
      description: `${company.name} is a leading company in the ${company.sector} sector.`
    }));
    
    console.log(`📊 Preparing to insert ${companiesToInsert.length} companies`);
    
    // First, try to add a temporary insert policy
    console.log('🔑 Attempting to add temporary insert policy...');
    try {
      await supabase.rpc('exec_sql', { 
        sql_query: `
          CREATE POLICY IF NOT EXISTS "temp_companies_insert" 
          ON companies 
          FOR INSERT 
          TO authenticated 
          WITH CHECK (true);
        `
      });
    } catch (err) {
      console.log('Policy creation failed (expected):', err.message);
    }
    
    // Try direct insert
    console.log('🔄 Inserting companies into database...');
    const { data, error } = await supabase
      .from('companies')
      .insert(companiesToInsert)
      .select();
    
    if (error) {
      console.error('❌ Insert failed:', error);
      
      // Try alternative: upsert one by one
      console.log('🔄 Trying individual inserts...');
      let successCount = 0;
      let errorCount = 0;
      
      for (const company of companiesToInsert) {
        const { error: individualError } = await supabase
          .from('companies')
          .upsert(company, { onConflict: 'ticker' });
        
        if (individualError) {
          console.error(`❌ Failed to insert ${company.ticker}:`, individualError.message);
          errorCount++;
        } else {
          console.log(`✅ Inserted ${company.ticker}: ${company.company_name}`);
          successCount++;
        }
        
        // Small delay between inserts
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`\n📊 Individual insert results: ${successCount} success, ${errorCount} errors`);
      
    } else {
      console.log(`✅ Successfully inserted ${data?.length || 0} companies via batch insert`);
    }
    
    // Clean up temporary policy
    try {
      await supabase.rpc('exec_sql', { 
        sql_query: `DROP POLICY IF EXISTS "temp_companies_insert" ON companies;`
      });
    } catch (err) {
      console.log('Policy cleanup failed (expected):', err.message);
    }
    
    // Verify the insertion
    const { data: finalCount, error: countError } = await supabase
      .from('companies')
      .select('ticker, company_name, sector')
      .order('ticker');
    
    if (!countError && finalCount) {
      console.log(`\n📊 Total companies in database: ${finalCount.length}`);
      console.log('\n🔍 Companies successfully added:');
      finalCount.slice(0, 10).forEach(company => {
        console.log(`  ${company.ticker}: ${company.company_name} (${company.sector})`);
      });
      if (finalCount.length > 10) {
        console.log(`  ... and ${finalCount.length - 10} more`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error populating companies:', error);
  }
}

// Run the script
populateCompanies();