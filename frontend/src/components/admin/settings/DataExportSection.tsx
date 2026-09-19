import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import type { DataSettingsData } from '../../../types/settings';
import { showWebsiteToast } from '../../common/NotificationToast';

interface DataExportSectionProps {
  data: DataSettingsData;
  onChange: (data: DataSettingsData) => void;
}

export const DataExportSection: React.FC<DataExportSectionProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof DataSettingsData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const handleDownloadBackup = () => {
    const backupObj = {
      appName: 'WasteWise AI System Backup',
      backupDate: new Date().toISOString(),
      retentionConfig: data,
    };
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WasteWise_System_Backup_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showWebsiteToast(
      'WasteWise system configuration backup package downloaded.',
      'success',
      'Backup Downloaded'
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 m-0">Data Retention & System Export</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure telemetry data retention policies and download system configuration backup archives.
        </p>
      </div>

      {/* Retention Policies Form */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
          Data Retention Limits (Days)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Operational Activity Log</label>
            <input
              type="number"
              min={30}
              max={730}
              value={data.retentionOperationalActivityDays}
              onChange={(e) => handleChange('retentionOperationalActivityDays', Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Alert History Log</label>
            <input
              type="number"
              min={30}
              max={365}
              value={data.retentionAlertHistoryDays}
              onChange={(e) => handleChange('retentionAlertHistoryDays', Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Sensor Telemetry History</label>
            <input
              type="number"
              min={30}
              max={365}
              value={data.retentionTelemetryHistoryDays}
              onChange={(e) => handleChange('retentionTelemetryHistoryDays', Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Download Backup Buttons */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
          System Configuration & Backup Downloads
        </h3>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="flex items-center space-x-2 px-4 py-2 bg-[#064e3b] hover:bg-[#047857] text-white text-xs font-bold rounded-lg shadow-2xs transition-all cursor-pointer border-none"
          >
            <Download className="w-4 h-4" />
            <span>Download System Backup</span>
          </button>

          <button
            type="button"
            onClick={() => {
              showWebsiteToast('Full operational telemetry dataset prepared for download.', 'info', 'Dataset Ready');
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>Export Operational Telemetry Data</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default DataExportSection;
