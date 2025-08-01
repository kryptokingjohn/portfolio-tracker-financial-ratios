import React, { useState } from 'react';
import { X, Download, FileText, Table, BarChart3, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { ExportService, ExportOptions, ReportData } from '../utils/exportService';
import { Holding, Transaction } from '../types/portfolio';
import { useSubscription } from '../hooks/useSubscription';

interface ExportModalProps {
  onClose: () => void;
  holdings: Holding[];
  transactions: Transaction[];
  portfolioMetrics: any;
}

export const ExportModal: React.FC<ExportModalProps> = ({ 
  onClose, 
  holdings, 
  transactions, 
  portfolioMetrics 
}) => {
  const { canExportFormat } = useSubscription();
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel' | 'json'>('csv');
  const [includeCharts, setIncludeCharts] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'portfolio', 'holdings', 'transactions', 'performance'
  ]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const exportSections = [
    { id: 'portfolio', label: 'Portfolio Summary', icon: BarChart3 },
    { id: 'holdings', label: 'Holdings Detail', icon: Table },
    { id: 'transactions', label: 'Transaction History', icon: Calendar },
    { id: 'performance', label: 'Performance Metrics', icon: BarChart3 },
    { id: 'risk', label: 'Risk Analysis', icon: BarChart3 },
    { id: 'attribution', label: 'Performance Attribution', icon: BarChart3 }
  ];

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(false);
    
    try {
      // Validate data
      if (holdings.length === 0) {
        throw new Error('No holdings data available to export');
      }

      const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return transactionDate >= startDate && transactionDate <= endDate;
      });

      const reportData: ReportData = {
        portfolio: portfolioMetrics,
        holdings,
        transactions: filteredTransactions,
        performance: portfolioMetrics,
        riskMetrics: {}, // Would be populated with actual risk metrics
        attribution: {} // Would be populated with actual attribution data
      };

      const exportOptions: ExportOptions = {
        format: exportFormat,
        includeCharts,
        dateRange,
        sections: selectedSections
      };

      const blob = await ExportService.generatePortfolioReport(reportData, exportOptions);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `portfolio-report-${timestamp}.${exportFormat === 'pdf' ? 'txt' : exportFormat}`;
      
      ExportService.downloadFile(blob, filename);
      setExportSuccess(true);
      
      // Auto-close after successful export
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error instanceof Error ? error.message : 'Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900/95 backdrop-blur-md border border-gray-600/30 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Download className="h-6 w-6 mr-2 text-blue-400" />
            Export Portfolio Report
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Success Message */}
          {exportSuccess && (
            <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-green-300 font-medium">Export Successful!</p>
                <p className="text-green-400 text-sm">Your portfolio report has been downloaded.</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {exportError && (
            <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-300 font-medium">Export Failed</p>
                <p className="text-red-400 text-sm">{exportError}</p>
              </div>
            </div>
          )}

          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'csv', label: 'CSV', icon: Table, description: 'Spreadsheet data' },
                { value: 'pdf', label: 'PDF', icon: FileText, description: 'Formatted report' },
                { value: 'excel', label: 'Excel', icon: Table, description: 'Excel workbook' },
                { value: 'json', label: 'JSON', icon: BarChart3, description: 'Raw data' }
              ].map((format) => {
                const Icon = format.icon;
                const isAccessible = canExportFormat(format.value as any);
                return (
                  <button
                    key={format.value}
                    type="button"
                    onClick={() => isAccessible && setExportFormat(format.value as any)}
                    disabled={!isAccessible}
                    className={`p-3 border-2 rounded-lg text-center transition-all relative ${
                      exportFormat === format.value && isAccessible
                        ? 'border-blue-500 bg-blue-600/20 text-white'
                        : isAccessible
                        ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white bg-gray-800/50'
                        : 'border-gray-700 bg-gray-700/30 text-gray-500 cursor-not-allowed'
                    }`}
                    title={!isAccessible ? 'Upgrade to Premium to unlock this export format' : ''}
                  >
                    <Icon className={`h-6 w-6 mx-auto mb-1 ${isAccessible ? 'text-blue-400' : 'text-gray-500'}`} />
                    <div className="font-medium text-sm">{format.label}</div>
                    <div className="text-xs text-gray-400">{format.description}</div>
                    {!isAccessible && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-lg">
                        <span className="text-xs font-medium text-yellow-400">Premium</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-3">
              Date Range (for transactions)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Sections to Include */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-3">
              Sections to Include
            </label>
            <div className="grid grid-cols-2 gap-3">
              {exportSections.map((section) => {
                const Icon = section.icon;
                const isSelected = selectedSections.includes(section.id);
                
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleSectionToggle(section.id)}
                    className={`p-3 border rounded-lg text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-600/20 text-white'
                        : 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-blue-400" />
                      <span className="font-medium text-sm">{section.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Options */}
          {exportFormat === 'pdf' && (
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-200">Include charts and visualizations</span>
              </label>
            </div>
          )}

          {/* Export Summary */}
          <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">Export Summary</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>Format: {exportFormat.toUpperCase()}</p>
              <p>Holdings: {holdings.length} positions</p>
              <p>Transactions: {(() => {
                const filtered = transactions.filter(t => {
                  const transactionDate = new Date(t.date);
                  const startDate = new Date(dateRange.start);
                  const endDate = new Date(dateRange.end);
                  return transactionDate >= startDate && transactionDate <= endDate;
                });
                return filtered.length;
              })()} in selected date range</p>
              <p>Sections: {selectedSections.length} selected</p>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600/30">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors backdrop-blur-sm border border-gray-600/30"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || selectedSections.length === 0}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Export Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};