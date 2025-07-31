#!/usr/bin/env node

/**
 * Script to populate the companies table with S&P 500 company data
 * This script reads the S&P 500 CSV data and inserts it into the Supabase database
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration - using service role key for admin operations
const supabaseUrl = 'https://oxxcykrriyrqzesamvxv.supabase.co';
// Note: This is the anon key - for production scripts, use service role key
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eGN5a3JyaXlycXplc2Ftdnh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMzE4MDcsImV4cCI6MjA2ODYwNzgwN30.GsO-rFvtAoBeQHaOGWTnK8yH2SvHxPesbaqHq-v_pBU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Alternative approach: Use raw SQL to bypass RLS
async function insertCompaniesDirectly(companies) {
  const values = companies.map(company => 
    `('${company.id}', '${company.ticker}', '${company.company_name.replace(/'/g, "''")}', '${company.sector}', '${company.industry || ''}', '${company.asset_type}', '${company.exchange}', '${company.currency}', '${company.description.replace(/'/g, "''")}', ${company.founded_year || 'null'}, '${company.created_at}', '${company.updated_at}')`
  ).join(',\n    ');
  
  const query = `
    INSERT INTO companies (id, ticker, company_name, sector, industry, asset_type, exchange, currency, description, founded_year, created_at, updated_at)
    VALUES 
    ${values}
    ON CONFLICT (ticker) DO UPDATE SET
      company_name = EXCLUDED.company_name,
      sector = EXCLUDED.sector,
      industry = EXCLUDED.industry,
      description = EXCLUDED.description,
      founded_year = EXCLUDED.founded_year,
      updated_at = EXCLUDED.updated_at;
  `;
  
  return await supabase.rpc('exec_sql', { sql_query: query });
}

// Function to parse CSV data
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
  const companies = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    
    // Handle quoted values that might contain commas
    const parsedValues = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parsedValues.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    parsedValues.push(currentValue.trim()); // Add the last value
    
    if (parsedValues.length >= 4) {
      companies.push({
        ticker: parsedValues[0].replace(/"/g, ''),
        name: parsedValues[1].replace(/"/g, ''),
        sector: parsedValues[2].replace(/"/g, ''),
        industry: parsedValues[3].replace(/"/g, ''),
        headquarters: parsedValues[4] ? parsedValues[4].replace(/"/g, '') : null,
        date_added: parsedValues[5] ? parsedValues[5].replace(/"/g, '') : null,
        cik: parsedValues[6] ? parsedValues[6].replace(/"/g, '') : null,
        founded: parsedValues[7] ? parsedValues[7].replace(/"/g, '') : null
      });
    }
  }
  
  return companies;
}

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
    console.log('🚀 Starting S&P 500 companies population...');
    
    // Read CSV file
    const csvPath = path.join(__dirname, '..', 'sp500_companies.csv');
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`);
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const companies = parseCSV(csvContent);
    
    console.log(`📊 Parsed ${companies.length} companies from CSV`);
    
    // Check if companies table exists and has data
    const { data: existingCompanies, error: checkError } = await supabase
      .from('companies')
      .select('ticker')
      .limit(10);
    
    if (checkError) {
      console.error('❌ Error checking existing companies:', checkError);
      return;
    }
    
    console.log(`📋 Found ${existingCompanies?.length || 0} existing companies in database`);
    
    // Prepare data for insertion - match the database schema
    const companiesToInsert = companies.map(company => ({
      id: generateUUID(),
      ticker: company.ticker.toUpperCase(),
      company_name: company.name,
      sector: company.sector || 'Unknown',
      industry: company.industry || 'Unknown',
      asset_type: 'stocks', // All S&P 500 companies are stocks
      exchange: 'NYSE/NASDAQ', // Most S&P 500 companies
      currency: 'USD',
      description: `${company.name} is a company in the ${company.sector} sector, specifically in ${company.industry}.`,
      founded_year: company.founded ? parseInt(company.founded.split(' ')[0]) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    console.log('🔄 Inserting companies into database...');
    
    // Insert companies in batches of 50 to avoid API limits
    const batchSize = 50;
    let insertedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < companiesToInsert.length; i += batchSize) {
      const batch = companiesToInsert.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('companies')
        .upsert(batch, { 
          onConflict: 'ticker',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
        errorCount += batch.length;
      } else {
        insertedCount += batch.length;
        console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(companiesToInsert.length/batchSize)} (${batch.length} companies)`);
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n🎉 Population complete!`);
    console.log(`✅ Successfully processed: ${insertedCount} companies`);
    console.log(`❌ Errors: ${errorCount} companies`);
    
    // Verify the insertion
    const { data: finalCount, error: countError } = await supabase
      .from('companies')
      .select('ticker', { count: 'exact' });
    
    if (!countError) {
      console.log(`📊 Total companies in database: ${finalCount?.length || 0}`);
    }
    
    console.log('\n🔍 Sample of inserted companies:');
    const { data: sampleCompanies } = await supabase
      .from('companies')
      .select('ticker, name, sector, industry')
      .limit(5);
    
    if (sampleCompanies) {
      sampleCompanies.forEach(company => {
        console.log(`  ${company.ticker}: ${company.name} (${company.sector})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error populating companies:', error);
  }
}

// Run the script
populateCompanies();