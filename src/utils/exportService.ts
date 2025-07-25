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
    const csvContent = [
      // Portfolio Summary
      'Portfolio Summary',
      'Metric,Value',
      `Total Value,$${data.portfolio.totalValue.toLocaleString()}`,
      `Total Cost,$${data.portfolio.totalCost.toLocaleString()}`,
      `Total Gain/Loss,$${data.portfolio.totalGainLoss.toLocaleString()}`,
      `Total Gain/Loss %,${data.portfolio.totalGainLossPercent.toFixed(2)}%`,
      '',
      
      // Holdings
      'Holdings',
      'Ticker,Company,Shares,Cost Basis,Current Price,Current Value,Gain/Loss,Gain/Loss %,Sector,Type',
      ...data.holdings.map(h => [
        h.ticker,
        h.company,
        h.shares,
        h.costBasis,
        h.currentPrice,
        h.shares * h.currentPrice,
        (h.shares * h.currentPrice) - (h.shares * h.costBasis),
        (((h.shares * h.currentPrice) - (h.shares * h.costBasis)) / (h.shares * h.costBasis) * 100).toFixed(2),
        h.sector,
        h.type
      ].join(',')),
      '',
      
      // Transactions
      'Transactions',
      'Date,Ticker,Type,Shares,Price,Amount,Fees,Notes',
      ...data.transactions.map(t => [
        t.date,
        t.ticker,
        t.type,
        t.shares || '',
        t.price || '',
        t.amount,
        t.fees || '',
        t.notes || ''
      ].join(','))
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv' });
  }

  private static async generatePDF(data: ReportData, options: ExportOptions): Promise<Blob> {
    // In a real implementation, this would use a PDF library like jsPDF
    const htmlContent = this.generateHTMLReport(data, options);
    
    // Mock PDF generation - in production, use jsPDF or similar
    const pdfContent = `
      Portfolio Report - Generated ${new Date().toLocaleDateString()}
      
      Portfolio Summary:
      Total Value: $${data.portfolio.totalValue.toLocaleString()}
      Total Cost: $${data.portfolio.totalCost.toLocaleString()}
      Total Gain/Loss: $${data.portfolio.totalGainLoss.toLocaleString()}
      
      Holdings (${data.holdings.length} positions):
      ${data.holdings.map(h => `${h.ticker}: ${h.shares} shares @ $${h.currentPrice}`).join('\n')}
      
      Recent Transactions (${data.transactions.length} transactions):
      ${data.transactions.slice(0, 10).map(t => `${t.date}: ${t.type} ${t.ticker} - $${t.amount}`).join('\n')}
    `;

    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  private static generateExcel(data: ReportData): Blob {
    // Mock Excel generation - in production, use SheetJS or similar
    const csvContent = this.generateCSV(data);
    return new Blob([csvContent], { type: 'application/vnd.ms-excel' });
  }

  private static generateJSON(data: ReportData): Blob {
    const jsonContent = JSON.stringify(data, null, 2);
    return new Blob([jsonContent], { type: 'application/json' });
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