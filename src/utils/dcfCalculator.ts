// Discounted Cash Flow (DCF) Calculator
export interface DCFInputs {
  currentFCF: number; // Current free cash flow
  growthRate: number; // Expected growth rate (%)
  terminalGrowthRate: number; // Terminal growth rate (%)
  discountRate: number; // Discount rate/WACC (%)
  projectionYears: number; // Number of projection years
  sharesOutstanding: number; // Shares outstanding
  cashAndEquivalents?: number; // Cash on balance sheet
  totalDebt?: number; // Total debt
}

export interface DCFResult {
  intrinsicValue: number;
  currentPrice: number;
  upside: number;
  upsidePercent: number;
  projectedCashFlows: number[];
  presentValues: number[];
  terminalValue: number;
  enterpriseValue: number;
  equityValue: number;
  confidence: string;
  sensitivity: {
    bearCase: number;
    baseCase: number;
    bullCase: number;
  };
}

export class DCFCalculator {
  static calculate(inputs: DCFInputs, currentPrice: number): DCFResult {
    const coreResult = this._calculateCore(inputs, currentPrice);
    const sensitivityAnalysis = this.calculateSensitivity(inputs, currentPrice);
    
    // Extract bear, base, and bull cases from sensitivity analysis
    const growthSensitivity = sensitivityAnalysis.growthRate;
    const baseIndex = Math.floor(growthSensitivity.length / 2);
    
    const sensitivity = {
      bearCase: growthSensitivity[0]?.value || coreResult.intrinsicValue * 0.8,
      baseCase: growthSensitivity[baseIndex]?.value || coreResult.intrinsicValue,
      bullCase: growthSensitivity[growthSensitivity.length - 1]?.value || coreResult.intrinsicValue * 1.2
    };
    
    // Determine confidence based on data quality
    const confidence = this.determineConfidence(inputs);
    
    return {
      ...coreResult,
      confidence,
      sensitivity
    };
  }

  private static _calculateCore(inputs: DCFInputs, currentPrice: number): Omit<DCFResult, 'sensitivity'> {
    const {
      currentFCF,
      growthRate,
      terminalGrowthRate,
      discountRate,
      projectionYears,
      sharesOutstanding,
      cashAndEquivalents = 0,
      totalDebt = 0
    } = inputs;

    // Project future cash flows
    const projectedCashFlows: number[] = [];
    const presentValues: number[] = [];
    
    for (let year = 1; year <= projectionYears; year++) {
      const projectedFCF = currentFCF * Math.pow(1 + growthRate / 100, year);
      const presentValue = projectedFCF / Math.pow(1 + discountRate / 100, year);
      
      projectedCashFlows.push(projectedFCF);
      presentValues.push(presentValue);
    }

    // Calculate terminal value
    const finalYearFCF = projectedCashFlows[projectedCashFlows.length - 1];
    const terminalFCF = finalYearFCF * (1 + terminalGrowthRate / 100);
    const terminalValue = terminalFCF / (discountRate / 100 - terminalGrowthRate / 100);
    const presentTerminalValue = terminalValue / Math.pow(1 + discountRate / 100, projectionYears);

    // Calculate enterprise and equity value
    const enterpriseValue = presentValues.reduce((sum, pv) => sum + pv, 0) + presentTerminalValue;
    const equityValue = enterpriseValue + cashAndEquivalents - totalDebt;
    const intrinsicValue = equityValue / sharesOutstanding;

    // Calculate upside
    const upside = intrinsicValue - currentPrice;
    const upsidePercent = (upside / currentPrice) * 100;

    return {
      intrinsicValue,
      currentPrice,
      upside,
      upsidePercent,
      projectedCashFlows,
      presentValues,
      terminalValue: presentTerminalValue,
      enterpriseValue,
      equityValue
    };
  }

  private static calculateSensitivity(inputs: DCFInputs, currentPrice: number) {
    const growthRates = [];
    const discountRates = [];

    // Growth rate sensitivity (-2% to +2% from base)
    for (let i = -2; i <= 2; i += 0.5) {
      const newInputs = { ...inputs, growthRate: inputs.growthRate + i };
      const result = this._calculateCore(newInputs, currentPrice);
      growthRates.push({ rate: inputs.growthRate + i, value: result.intrinsicValue });
    }

    // Discount rate sensitivity (-2% to +2% from base)
    for (let i = -2; i <= 2; i += 0.5) {
      const newInputs = { ...inputs, discountRate: inputs.discountRate + i };
      const result = this._calculateCore(newInputs, currentPrice);
      discountRates.push({ rate: inputs.discountRate + i, value: result.intrinsicValue });
    }

    return { growthRate: growthRates, discountRate: discountRates };
  }

  private static determineConfidence(inputs: DCFInputs): string {
    // Simple confidence scoring based on data availability
    let score = 0;
    if (inputs.currentFCF > 0) score += 1;
    if (inputs.growthRate > 0 && inputs.growthRate < 30) score += 1;
    if (inputs.sharesOutstanding > 0) score += 1;
    if (inputs.cashAndEquivalents !== undefined) score += 1;
    if (inputs.totalDebt !== undefined) score += 1;
    
    if (score >= 4) return 'High';
    if (score >= 3) return 'Medium';
    return 'Low';
  }

  // Estimate DCF inputs from financial data
  static estimateInputs(fundamentals: any, marketData?: any): DCFInputs {
    // Use actual market cap or estimate from current price
    const currentPrice = marketData?.price || fundamentals.currentPrice || 100;
    const marketCap = fundamentals.marketCap || marketData?.marketCap || currentPrice * 1000000000;
    
    // Estimate revenue from market cap and P/E ratio
    const peRatio = Math.max(fundamentals.peRatio || fundamentals.pe || 20, 5);
    const netMargin = fundamentals.netMargin || 10;
    
    // More robust FCF estimation
    const revenue = marketCap / peRatio;
    const netIncome = revenue * Math.max(netMargin, 5) / 100; // Ensure positive margin
    const estimatedFCF = Math.max(netIncome * 0.8, marketCap * 0.05); // FCF as 80% of net income, minimum 5% of market cap
    
    // Ensure shares outstanding is reasonable
    const sharesOutstanding = Math.max(marketCap / currentPrice, 1000000); // Minimum 1M shares

    return {
      currentFCF: estimatedFCF,
      growthRate: Math.max(2, Math.min(25, Math.abs(fundamentals.revenueGrowth || 8))), // Cap between 2-25%
      terminalGrowthRate: 2.5, // Long-term GDP growth
      discountRate: Math.max(8, Math.min(15, 10 + (marketData?.beta || fundamentals.beta || 1) * 2)), // Risk-adjusted discount rate
      projectionYears: 10,
      sharesOutstanding,
      cashAndEquivalents: Math.max(0, marketCap * 0.1), // Estimate 10% cash
      totalDebt: Math.max(0, marketCap * Math.min(fundamentals.debtToEquity || 0.3, 1)) // Cap debt ratio
    };
  }
}