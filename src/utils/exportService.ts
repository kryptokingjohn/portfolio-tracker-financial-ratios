// Export service for generating reports and data exports
export interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel' | 'json';
  includeCharts?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  sections?: string[];
}

export interface ReportData {
  portfolio: any;
  holdings: any[];
  transactions: any[];
  performance: any;
  riskMetrics: any;
  attribution: any;
}

export class ExportService {
  static async generatePortfolioReport(data: ReportData, options: ExportOptions): Promise<Blob> {
    switch (options.format) {
      case 'csv':
        return this.generateCSV(data);
      case 'pdf':
        return this.generatePDF(data, options);
      case 'excel':
        return this.generateExcel(data);
      case 'json':
        return this.generateJSON(data);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private static generateCSV(data: ReportData): Blob {
    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      // Portfolio Summary
      'Portfolio Summary',
      'Metric,Value',
      `Total Value,"$${data.portfolio.totalValue?.toLocaleString() || '0'}"`,
      `Total Cost,"$${data.portfolio.totalCost?.toLocaleString() || '0'}"`,
      `Total Gain/Loss,"$${data.portfolio.totalGainLoss?.toLocaleString() || '0'}"`,
      `Total Gain/Loss %,"${data.portfolio.totalGainLossPercent?.toFixed(2) || '0'}%"`,
      '',
      
      // Holdings
      'Holdings',
      'Ticker,Company,Shares,Cost Basis,Current Price,Current Value,Gain/Loss,Gain/Loss %,Sector,Type',
      ...data.holdings.map(h => {
        const currentValue = (h.shares || 0) * (h.currentPrice || 0);
        const totalCost = (h.shares || 0) * (h.costBasis || 0);
        const gainLoss = currentValue - totalCost;
        const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost * 100).toFixed(2) : '0';
        
        return [
          escapeCSV(h.ticker || ''),
          escapeCSV(h.company || ''),
          h.shares || 0,
          h.costBasis || 0,
          h.currentPrice || 0,
          currentValue.toFixed(2),
          gainLoss.toFixed(2),
          gainLossPercent,
          escapeCSV(h.sector || ''),
          escapeCSV(h.type || '')
        ].join(',');
      }),
      '',
      
      // Transactions
      'Transactions',
      'Date,Ticker,Type,Shares,Price,Amount,Fees,Notes',
      ...data.transactions.map(t => [
        escapeCSV(t.date || ''),
        escapeCSV(t.ticker || ''),
        escapeCSV(t.type || ''),
        t.shares || '',
        t.price || '',
        t.amount || '',
        t.fees || '',
        escapeCSV(t.notes || '')
      ].join(','))
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  }

  private static async generatePDF(data: ReportData, options: ExportOptions): Promise<Blob> {
    // Generate a formatted text report that can be saved as PDF
    const formatCurrency = (value: number) => `$${value?.toLocaleString() || '0'}`;
    const formatPercent = (value: number) => `${value?.toFixed(2) || '0'}%`;
    
    const reportDate = new Date().toLocaleDateString();
    const reportTime = new Date().toLocaleTimeString();
    
    const pdfContent = `
PORTFOLIO REPORT
Generated: ${reportDate} at ${reportTime}

===============================================
PORTFOLIO SUMMARY
===============================================
Total Portfolio Value: ${formatCurrency(data.portfolio.totalValue)}
Total Cost Basis:      ${formatCurrency(data.portfolio.totalCost)}
Total Gain/Loss:       ${formatCurrency(data.portfolio.totalGainLoss)}
Total Return:          ${formatPercent(data.portfolio.totalGainLossPercent)}

===============================================
HOLDINGS BREAKDOWN (${data.holdings.length} positions)
===============================================
${data.holdings.map(h => {
  const currentValue = (h.shares || 0) * (h.currentPrice || 0);
  const totalCost = (h.shares || 0) * (h.costBasis || 0);
  const gainLoss = currentValue - totalCost;
  const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost * 100) : 0;
  
  return `
${h.ticker || 'N/A'} - ${h.company || 'Unknown Company'}
  Shares:        ${h.shares || 0}
  Cost Basis:    ${formatCurrency(h.costBasis || 0)}
  Current Price: ${formatCurrency(h.currentPrice || 0)}
  Current Value: ${formatCurrency(currentValue)}
  Gain/Loss:     ${formatCurrency(gainLoss)} (${formatPercent(gainLossPercent)})
  Sector:        ${h.sector || 'N/A'}
  Type:          ${h.type || 'N/A'}
`;
}).join('\n')}

===============================================
TRANSACTION HISTORY (${data.transactions.length} transactions)
===============================================
${data.transactions.slice(0, 50).map(t => `
${t.date || 'N/A'} | ${t.type || 'N/A'} | ${t.ticker || 'N/A'}
  Shares: ${t.shares || 'N/A'}
  Price:  ${formatCurrency(t.price || 0)}
  Amount: ${formatCurrency(t.amount || 0)}
  Fees:   ${formatCurrency(t.fees || 0)}
  ${t.notes ? `Notes: ${t.notes}` : ''}
`).join('\n')}

${data.transactions.length > 50 ? `\n... and ${data.transactions.length - 50} more transactions\n` : ''}

===============================================
REPORT DISCLAIMER
===============================================
This report is generated automatically based on the data in your portfolio.
Please verify all information for accuracy. Past performance does not
indicate future results. Consult with a financial advisor before making
investment decisions.

Report generated by Portfolio Tracker with Financial Ratios
    `;

    return new Blob([pdfContent], { type: 'text/plain;charset=utf-8' });
  }

  private static generateExcel(data: ReportData): Blob {
    // Generate Excel-compatible CSV with proper formatting
    const csvData = this.generateCSV(data);
    return new Blob([csvData], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  private static generateJSON(data: ReportData): Blob {
    // Create a clean, structured JSON export
    const exportData = {
      exportInfo: {
        generatedAt: new Date().toISOString(),
        generatedBy: 'Portfolio Tracker with Financial Ratios',
        version: '1.0.0'
      },
      portfolio: {
        summary: {
          totalValue: data.portfolio.totalValue || 0,
          totalCost: data.portfolio.totalCost || 0,
          totalGainLoss: data.portfolio.totalGainLoss || 0,
          totalGainLossPercent: data.portfolio.totalGainLossPercent || 0,
          positionCount: data.holdings.length,
          transactionCount: data.transactions.length
        }
      },
      holdings: data.holdings.map(h => ({
        ticker: h.ticker || '',
        company: h.company || '',
        shares: h.shares || 0,
        costBasis: h.costBasis || 0,
        currentPrice: h.currentPrice || 0,
        currentValue: (h.shares || 0) * (h.currentPrice || 0),
        gainLoss: ((h.shares || 0) * (h.currentPrice || 0)) - ((h.shares || 0) * (h.costBasis || 0)),
        gainLossPercent: (h.shares || 0) * (h.costBasis || 0) > 0 ? 
          (((h.shares || 0) * (h.currentPrice || 0)) - ((h.shares || 0) * (h.costBasis || 0))) / ((h.shares || 0) * (h.costBasis || 0)) * 100 : 0,
        sector: h.sector || '',
        type: h.type || '',
        // Include financial ratios if available
        ...(h.pe && { pe: h.pe }),
        ...(h.pb && { pb: h.pb }),
        ...(h.roe && { roe: h.roe }),
        ...(h.dividendYield && { dividendYield: h.dividendYield })
      })),
      transactions: data.transactions.map(t => ({
        date: t.date || '',
        ticker: t.ticker || '',
        type: t.type || '',
        shares: t.shares || null,
        price: t.price || null,
        amount: t.amount || 0,
        fees: t.fees || 0,
        notes: t.notes || ''
      }))
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    return new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
  }

  private static generateHTMLReport(data: ReportData, options: ExportOptions): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Portfolio Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .summary { background-color: #f9f9f9; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>Portfolio Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        
        <div class="summary">
          <h2>Portfolio Summary</h2>
          <p>Total Value: $${data.portfolio.totalValue.toLocaleString()}</p>
          <p>Total Cost: $${data.portfolio.totalCost.toLocaleString()}</p>
          <p>Total Gain/Loss: $${data.portfolio.totalGainLoss.toLocaleString()}</p>
        </div>
        
        <h2>Holdings</h2>
        <table>
          <tr>
            <th>Ticker</th>
            <th>Company</th>
            <th>Shares</th>
            <th>Current Price</th>
            <th>Current Value</th>
            <th>Gain/Loss</th>
          </tr>
          ${data.holdings.map(h => `
            <tr>
              <td>${h.ticker}</td>
              <td>${h.company}</td>
              <td>${h.shares}</td>
              <td>$${h.currentPrice}</td>
              <td>$${(h.shares * h.currentPrice).toLocaleString()}</td>
              <td>$${((h.shares * h.currentPrice) - (h.shares * h.costBasis)).toLocaleString()}</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;
  }

  static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}