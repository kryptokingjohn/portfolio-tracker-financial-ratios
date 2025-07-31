#!/usr/bin/env node

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://oxxcykrriyrqzesamvxv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eGN5a3JyaXlycXplc2Ftdnh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMzE4MDcsImV4cCI6MjA2ODYwNzgwN30.GsO-rFvtAoBeQHaOGWTnK8yH2SvHxPesbaqHq-v_pBU');

function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const companies = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length >= 4) {
      companies.push({
        ticker: values[0].replace(/"/g, ''),
        name: values[1].replace(/"/g, ''),
        sector: values[2].replace(/"/g, ''),
        industry: values[3].replace(/"/g, '')
      });
    }
  }
  return companies;
}

async function analyzeMissingCompanies() {
  console.log('🔍 Analyzing missing S&P 500 companies...');
  
  // Read CSV data
  const csvContent = fs.readFileSync('sp500_companies.csv', 'utf8');
  const csvCompanies = parseCSV(csvContent);
  console.log(`📄 CSV contains: ${csvCompanies.length} companies`);
  
  // Get companies in database
  const { data: dbCompanies } = await supabase
    .from('companies')
    .select('ticker, company_name')
    .order('ticker');
  
  console.log(`🗄️ Database contains: ${dbCompanies.length} companies`);
  
  // Find missing companies
  const dbTickers = new Set(dbCompanies.map(c => c.ticker));
  const missingCompanies = csvCompanies.filter(c => !dbTickers.has(c.ticker));
  
  console.log(`❌ Missing companies: ${missingCompanies.length}`);
  
  if (missingCompanies.length > 0) {
    console.log('\n📋 Missing S&P 500 companies:');
    missingCompanies.slice(0, 30).forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.ticker}: ${company.name} (${company.sector})`);
    });
    
    if (missingCompanies.length > 30) {
      console.log(`  ... and ${missingCompanies.length - 30} more`);
    }
    
    // Group by sector
    const missingSectors = {};
    missingCompanies.forEach(company => {
      missingSectors[company.sector] = (missingSectors[company.sector] || 0) + 1;
    });
    
    console.log('\n📊 Missing companies by sector:');
    Object.entries(missingSectors)
      .sort(([,a], [,b]) => b - a)
      .forEach(([sector, count]) => {
        console.log(`  ${sector}: ${count} companies`);
      });
  }
  
  // Check if any companies have transactions
  console.log('\n🔗 Checking for companies with transaction constraints...');
  const { data: companiesWithTransactions } = await supabase
    .from('transactions')
    .select('company_id')
    .not('company_id', 'is', null);
  
  if (companiesWithTransactions) {
    console.log(`📈 Found ${companiesWithTransactions.length} transactions referencing companies`);
  }
}

analyzeMissingCompanies().catch(console.error);