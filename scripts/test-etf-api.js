#!/usr/bin/env node

/**
 * Test ETF API data fetching to debug AUM issue
 */

const FMP_API_KEY = 'dlzQb3cU7yOPGnNy8agxl9e7PI7pkAtH';
const FMP_BASE_URL = 'https://financialmodelingprep.com/stable';

async function testETFAPI() {
  console.log('🧪 Testing ETF API data fetching...\n');
  
  // Test with common ETF symbols
  const testSymbols = ['SPY', 'QQQ', 'VTI', 'SCHD', 'VEA'];
  
  for (const symbol of testSymbols) {
    try {
      console.log(`📊 Testing ${symbol}...`);
      
      const url = `${FMP_BASE_URL}/etf/info?symbol=${symbol}&apikey=${FMP_API_KEY}`;
      console.log(`🔗 URL: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log(`❌ HTTP Error: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`📥 Raw API Response:`, JSON.stringify(data, null, 2));
      
      if (!data || data.length === 0) {
        console.log(`⚠️ No data returned for ${symbol}`);
        continue;
      }
      
      const etfData = Array.isArray(data) ? data[0] : data;
      
      // Check specific fields we care about
      console.log(`📋 Parsed Data for ${symbol}:`);
      console.log(`   Name: ${etfData.name || 'N/A'}`);
      console.log(`   Expense Ratio: ${etfData.expenseRatio || 'N/A'}`);
      console.log(`   AUM (raw field): ${etfData.aum || 'N/A'}`);
      console.log(`   AUM (assetsUnderManagement): ${etfData.assetsUnderManagement || 'N/A'}`);
      console.log(`   Holdings Count: ${etfData.holdingsCount || 'N/A'}`);
      console.log(`   Dividend Yield: ${etfData.dividendYield || 'N/A'}`);
      
      // Test AUM formatting with correct field
      if (etfData.assetsUnderManagement) {
        const aum = parseFloat(etfData.assetsUnderManagement);
        console.log(`   AUM (parsed): ${aum}`);
        console.log(`   AUM (formatted): ${formatAUM(aum)}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.error(`💥 Error testing ${symbol}:`, error.message);
      console.log('');
    }
  }
}

function formatAUM(aum) {
  if (aum >= 1e12) {
    return `$${(aum / 1e12).toFixed(1)}T`;
  } else if (aum >= 1e9) {
    return `$${(aum / 1e9).toFixed(1)}B`;
  } else if (aum >= 1e6) {
    return `$${(aum / 1e6).toFixed(1)}M`;
  } else {
    return `$${aum.toLocaleString()}`;
  }
}

testETFAPI().catch(console.error);