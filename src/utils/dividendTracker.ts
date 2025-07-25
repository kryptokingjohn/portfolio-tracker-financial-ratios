// Dividend tracking and analysis utilities
import { Transaction, Holding } from '../types/portfolio';

export interface DividendPayment {
  id: string;
  ticker: string;
  company: string;
  exDate: string;
  payDate: string;
  recordDate?: string;
  amount: number;
  shares: number;
  totalPayment: number;
  dividendType: 'ordinary' | 'qualified' | 'special' | 'return_of_capital';
  taxWithheld?: number;
}

export interface DividendProjection {
  ticker: string;
  nextExDate: string;
  nextPayDate: string;
  estimatedAmount: number;
  frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  confidence: 'high' | 'medium' | 'low';
}

export interface DividendAnalysis {
  totalAnnualIncome: number;
  monthlyAverage: number;
  yieldOnCost: number;
  currentYield: number;
  growthRate: number;
  paymentHistory: DividendPayment[];
  upcomingPayments: DividendProjection[];
  dividendGrowthStreak: number;
}

export class DividendTracker {
  static analyzeDividends(holdings: Holding[], transactions: Transaction[]): DividendAnalysis {
    const dividendTransactions = transactions.filter(t => t.type === 'dividend');
    const paymentHistory = this.buildPaymentHistory(dividendTransactions, holdings);
    const upcomingPayments = this.projectUpcomingDividends(holdings);
    
    let totalAnnualIncome = 0;
    let totalCostBasis = 0;
    let totalCurrentValue = 0;

    holdings.forEach(holding => {
      if (holding.dividend && holding.dividend > 0) {
        const annualDividend = holding.shares * holding.dividend;
        totalAnnualIncome += annualDividend;
        totalCostBasis += holding.shares * holding.costBasis;
        totalCurrentValue += holding.shares * holding.currentPrice;
      }
    });

    const monthlyAverage = totalAnnualIncome / 12;
    const yieldOnCost = totalCostBasis > 0 ? (totalAnnualIncome / totalCostBasis) * 100 : 0;
    const currentYield = totalCurrentValue > 0 ? (totalAnnualIncome / totalCurrentValue) * 100 : 0;
    const growthRate = this.calculateDividendGrowthRate(paymentHistory);
    const dividendGrowthStreak = this.calculateGrowthStreak(paymentHistory);

    return {
      totalAnnualIncome,
      monthlyAverage,
      yieldOnCost,
      currentYield,
      growthRate,
      paymentHistory,
      upcomingPayments,
      dividendGrowthStreak
    };
  }

  private static buildPaymentHistory(dividendTransactions: Transaction[], holdings: Holding[]): DividendPayment[] {
    return dividendTransactions.map((transaction, index) => {
      const holding = holdings.find(h => h.ticker === transaction.ticker);
      
      return {
        id: `div-${index}`,
        ticker: transaction.ticker,
        company: holding?.company || transaction.ticker,
        exDate: transaction.date, // Simplified - would need actual ex-date
        payDate: transaction.date,
        amount: transaction.price || 0,
        shares: transaction.shares || 0,
        totalPayment: transaction.amount || 0,
        dividendType: 'ordinary' as const,
        taxWithheld: 0
      };
    });
  }

  private static projectUpcomingDividends(holdings: Holding[]): DividendProjection[] {
    const projections: DividendProjection[] = [];
    
    holdings.forEach(holding => {
      if (holding.dividend && holding.dividend > 0) {
        // Estimate next payment date (simplified)
        const today = new Date();
        const nextQuarter = new Date(today);
        nextQuarter.setMonth(Math.ceil((today.getMonth() + 1) / 3) * 3);
        
        const exDate = new Date(nextQuarter);
        exDate.setDate(15); // Assume mid-month ex-date
        
        const payDate = new Date(exDate);
        payDate.setDate(payDate.getDate() + 14); // Pay date typically 2 weeks after ex-date

        projections.push({
          ticker: holding.ticker,
          nextExDate: exDate.toISOString().split('T')[0],
          nextPayDate: payDate.toISOString().split('T')[0],
          estimatedAmount: holding.dividend / 4, // Quarterly payment
          frequency: 'quarterly',
          confidence: 'medium'
        });
      }
    });

    return projections.sort((a, b) => 
      new Date(a.nextExDate).getTime() - new Date(b.nextExDate).getTime()
    );
  }

  private static calculateDividendGrowthRate(paymentHistory: DividendPayment[]): number {
    // Group payments by ticker and year
    const yearlyPayments: { [ticker: string]: { [year: number]: number } } = {};
    
    paymentHistory.forEach(payment => {
      const year = new Date(payment.payDate).getFullYear();
      if (!yearlyPayments[payment.ticker]) {
        yearlyPayments[payment.ticker] = {};
      }
      if (!yearlyPayments[payment.ticker][year]) {
        yearlyPayments[payment.ticker][year] = 0;
      }
      yearlyPayments[payment.ticker][year] += payment.totalPayment;
    });

    // Calculate average growth rate across all holdings
    let totalGrowthRates = 0;
    let tickerCount = 0;

    Object.entries(yearlyPayments).forEach(([ticker, yearlyData]) => {
      const years = Object.keys(yearlyData).map(Number).sort();
      if (years.length >= 2) {
        const firstYear = years[0];
        const lastYear = years[years.length - 1];
        const firstYearAmount = yearlyData[firstYear];
        const lastYearAmount = yearlyData[lastYear];
        
        if (firstYearAmount > 0) {
          const yearsSpan = lastYear - firstYear;
          const growthRate = Math.pow(lastYearAmount / firstYearAmount, 1 / yearsSpan) - 1;
          totalGrowthRates += growthRate;
          tickerCount++;
        }
      }
    });

    return tickerCount > 0 ? (totalGrowthRates / tickerCount) * 100 : 0;
  }

  private static calculateGrowthStreak(paymentHistory: DividendPayment[]): number {
    // Simplified calculation - would need more sophisticated logic
    return 5; // Mock 5-year growth streak
  }

  static generateDividendCalendar(projections: DividendProjection[]): Array<{
    month: string;
    payments: Array<{
      ticker: string;
      amount: number;
      date: string;
    }>;
    totalAmount: number;
  }> {
    const calendar: { [month: string]: Array<{ ticker: string; amount: number; date: string }> } = {};
    
    projections.forEach(projection => {
      const payDate = new Date(projection.nextPayDate);
      const monthKey = payDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!calendar[monthKey]) {
        calendar[monthKey] = [];
      }
      
      calendar[monthKey].push({
        ticker: projection.ticker,
        amount: projection.estimatedAmount,
        date: projection.nextPayDate
      });
    });

    return Object.entries(calendar).map(([month, payments]) => ({
      month,
      payments,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0)
    }));
  }

  static calculateDividendMetrics(holding: Holding, transactions: Transaction[]) {
    const dividendTransactions = transactions.filter(t => 
      t.ticker === holding.ticker && t.type === 'dividend'
    );

    const totalDividendsReceived = dividendTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const currentAnnualIncome = holding.dividend ? holding.shares * holding.dividend : 0;
    const yieldOnCost = holding.costBasis > 0 && holding.dividend ? 
      (holding.dividend / holding.costBasis) * 100 : 0;

    return {
      totalDividendsReceived,
      currentAnnualIncome,
      yieldOnCost,
      paymentsCount: dividendTransactions.length,
      lastPaymentDate: dividendTransactions.length > 0 ? 
        dividendTransactions[dividendTransactions.length - 1].date : null
    };
  }
}