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

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function addMissingCompanies() {
  console.log('🚀 Adding remaining S&P 500 companies...');
  
  // Read CSV data
  const csvContent = fs.readFileSync('sp500_companies.csv', 'utf8');
  const csvCompanies = parseCSV(csvContent);
  
  // Get existing companies
  const { data: dbCompanies } = await supabase
    .from('companies')
    .select('ticker')
    .order('ticker');
  
  const dbTickers = new Set(dbCompanies.map(c => c.ticker));
  const missingCompanies = csvCompanies.filter(c => !dbTickers.has(c.ticker));
  
  console.log(`📊 Found ${missingCompanies.length} missing companies to add`);
  
  if (missingCompanies.length === 0) {
    console.log('✅ No missing companies - all S&P 500 companies are already in the database!');
    return;
  }
  
  // Prepare data for insertion - using INSERT only (no upsert to avoid conflicts)
  const companiesToInsert = missingCompanies.map(company => ({
    id: generateUUID(),
    ticker: company.ticker.toUpperCase(),
    company_name: company.name,
    sector: company.sector,
    industry: company.industry,
    asset_type: 'stocks',
    exchange: 'NYSE/NASDAQ',
    currency: 'USD',
    description: `${company.name} is a company in the ${company.sector} sector, specifically in ${company.industry}.`
  }));
  
  console.log('🔄 Inserting missing companies...');
  
  let successCount = 0;
  let errorCount = 0;
  
  // Insert in smaller batches to avoid issues
  const batchSize = 25;
  
  for (let i = 0; i < companiesToInsert.length; i += batchSize) {
    const batch = companiesToInsert.slice(i, i + batchSize);
    
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(companiesToInsert.length/batchSize)}...`);
    
    const { data, error } = await supabase
      .from('companies')
      .insert(batch)
      .select();
    
    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error.message);
      errorCount += batch.length;
    } else {
      const inserted = data?.length || 0;
      successCount += inserted;
      console.log(`✅ Successfully inserted ${inserted} companies from batch ${Math.floor(i/batchSize) + 1}`);
    }
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n🎉 Addition complete!`);
  console.log(`✅ Successfully added: ${successCount} companies`);
  console.log(`❌ Errors: ${errorCount} companies`);
  
  // Final verification
  const { data: finalCount } = await supabase
    .from('companies')
    .select('ticker, company_name, sector')
    .order('ticker');
  
  if (finalCount) {
    console.log(`\n📊 Total companies now in database: ${finalCount.length}`);
    
    // Check if we have all S&P 500 companies
    const finalTickers = new Set(finalCount.map(c => c.ticker));
    const stillMissing = csvCompanies.filter(c => !finalTickers.has(c.ticker));
    
    if (stillMissing.length === 0) {
      console.log('🎯 SUCCESS! All 503 S&P 500 companies are now in the database!');
    } else {
      console.log(`⚠️ Still missing ${stillMissing.length} companies`);
    }
    
    // Show sector breakdown
    const sectorCounts = {};
    finalCount.forEach(company => {
      if (company.sector) {
        sectorCounts[company.sector] = (sectorCounts[company.sector] || 0) + 1;
      }
    });
    
    console.log('\n📈 Final sector distribution:');
    Object.entries(sectorCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([sector, count]) => {
        console.log(`  ${sector}: ${count} companies`);
      });
  }
}

addMissingCompanies().catch(console.error);