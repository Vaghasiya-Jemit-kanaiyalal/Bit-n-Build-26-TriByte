import React, { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { showWebsiteToast } from '../common/NotificationToast';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateRange: string;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose, dateRange }) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'report' | 'json'>('csv');
  const [includeSections, setIncludeSections] = useState({
    waste: true,
    collections: true,
    zones: true,
    fleet: true,
    recycling: true,
    predictions: true,
  });

  if (!isOpen) return null;

  const handleExport = () => {
    // Generate mock CSV content client side
    let content = '';
    if (exportFormat === 'csv') {
      content = `Date,Zone,Waste_Generated_Tons,Waste_Collected_Tons,Overflow_Events,Collection_SLA_Pct\n`;
      content += `2026-09-01,Industrial Zone,2.4,2.2,2,82%\n`;
      content += `2026-09-01,Central Zone,2.1,2.0,1,94%\n`;
      content += `2026-09-01,Residential Zone,1.8,1.8,0,91%\n`;
      content += `2026-09-01,West Zone,1.7,1.6,1,92%\n`;

      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `WasteWise_Analytics_${dateRange.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // JSON export
      const mockJson = {
        title: "Waste Management Analytics Executive Report",
        period: dateRange,
        generatedAt: new Date().toISOString(),
        summary: {
          totalWasteCollectedTons: 248.6,
          collectionEfficiencyRate: 91.4,
          recyclableRecoveryRate: 53.2,
          overflowEvents: 42
        }
      };
      const blob = new Blob([JSON.stringify(mockJson, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `WasteWise_Executive_Report_${dateRange.replace(/\s+/g, '_')}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    showWebsiteToast(
      `Analytics ${exportFormat.toUpperCase()} report generated and downloaded for ${dateRange}.`,
      'success',
      'Report Downloaded'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 text-[#047857] rounded-lg">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0 leading-tight">Export Analytics Report</h3>
              <span className="text-[11px] text-slate-500 font-medium">Period: {dateRange}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer border-none bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Options */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setExportFormat('csv')}
              className={`p-3 rounded-lg border text-left cursor-pointer flex items-center space-x-2 transition-all ${
                exportFormat === 'csv'
                  ? 'border-[#047857] bg-emerald-50/70 text-[#047857]'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <div>
                <span className="text-xs font-bold block leading-tight">CSV Dataset</span>
                <span className="text-[10px] text-slate-500">Spreadsheet data</span>
              </div>
            </button>

            <button
              onClick={() => setExportFormat('report')}
              className={`p-3 rounded-lg border text-left cursor-pointer flex items-center space-x-2 transition-all ${
                exportFormat === 'report'
                  ? 'border-[#047857] bg-emerald-50/70 text-[#047857]'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <div>
                <span className="text-xs font-bold block leading-tight">Executive JSON</span>
                <span className="text-[10px] text-slate-500">Structured telemetry</span>
              </div>
            </button>
          </div>
        </div>

        {/* Included Sections Checkboxes */}
        <div className="mb-6">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
            Include Telemetry Sections
          </label>

          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-700">
            {Object.entries(includeSections).map(([key, val]) => (
              <label key={key} className="flex items-center space-x-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={val}
                  onChange={() => setIncludeSections(prev => ({ ...prev, [key]: !val }))}
                  className="rounded text-[#047857] focus:ring-0 cursor-pointer"
                />
                <span className="capitalize">{key} Telemetry</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-5 py-2 bg-[#064e3b] hover:bg-[#047857] text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer border-none flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate & Download</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExportReportModal;
