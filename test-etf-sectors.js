/**
 * Test script to verify ETF sector weightings fix
 */

// Simulate the ETF sector weightings API call
const FMP_API_KEY = 'dlzQb3cU7yOPGnNy8agxl9e7PI7pkAtH';

async function testETFSectorWeightings(symbol) {
  console.log(`🧪 Testing ETF sector weightings for ${symbol}...`);
  
  try {
    // Test the new dedicated sector weightings endpoint
    const url = `https://financialmodelingprep.com/api/v3/etf-sector-weightings/${symbol}?apikey=${FMP_API_KEY}`;
    console.log(`📡 Fetching from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API response not ok: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Raw API response for ${symbol}:`, data);
    
    if (!data || data.length === 0) {
      console.warn(`⚠️ No sector weightings data found for ${symbol}`);
      return null;
    }
    
    // Process the sector weightings
    const sectorWeightings = {};
    const sectorData = Array.isArray(data) ? data : [data];
    
    sectorData.forEach((item) => {
      const sectorName = item.sector || item.sectorName || item.name;
      
      // Handle percentage strings like "35.06%" by removing % and parsing
      let weight = 0;
      if (item.weightPercentage) {
        weight = parseFloat(item.weightPercentage.replace('%', ''));
      } else {
        weight = parseFloat(item.weight || item.weighting || item.percentage || 0);
      }
      
      if (sectorName && weight > 0) {
        sectorWeightings[sectorName] = weight;
      }
    });
    
    console.log(`📊 Processed sector weightings for ${symbol}:`, sectorWeightings);
    
    // Calculate top sectors (like the app does)
    const topSectors = Object.entries(sectorWeightings)
      .map(([sector, percentage]) => ({ sector, percentage: Number(percentage) }))
      .filter(item => !isNaN(item.percentage) && item.percentage > 0)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
    
    console.log(`🎯 Top 5 sectors for ${symbol}:`, topSectors);
    
    // Test what would show in the UI
    const topSectorsDisplay = topSectors.slice(0, 2).map(s => s.sector).join(', ');
    console.log(`💻 UI would display: "${topSectorsDisplay}"`);
    
    return {
      sectorWeightings,
      topSectors,
      topSectorsDisplay
    };
    
  } catch (error) {
    console.error(`❌ Error testing ${symbol}:`, error);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting ETF sector weightings tests...\n');
  
  // Test common ETFs
  const testETFs = ['SPY', 'VTI', 'QQQ', 'IWM', 'JEPI'];
  
  for (const etf of testETFs) {
    console.log(`\n${'='.repeat(50)}`);
    const result = await testETFSectorWeightings(etf);
    
    if (result && result.topSectorsDisplay) {
      console.log(`✅ ${etf}: SUCCESS - Would show "${result.topSectorsDisplay}"`);
    } else {
      console.log(`❌ ${etf}: FAILED - No sector data`);
    }
    
    // Small delay to respect API limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log('🎉 ETF sector weightings tests completed!');
  console.log('');
  console.log('✅ If you see sector names displayed above, the fix is working!');
  console.log('❌ If you see "FAILED" messages, there may still be API issues.');
}

// Run the tests
runTests().catch(console.error);