import React from 'react';
import { Battery } from 'lucide-react';
import type { BinMonitoringSettings } from '../../../types/settings';

interface BinMonitoringSectionProps {
  data: BinMonitoringSettings;
  onChange: (data: BinMonitoringSettings) => void;
}

export const BinMonitoringSection: React.FC<BinMonitoringSectionProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof BinMonitoringSettings, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 m-0">Bin & Telemetry Monitoring</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure IoT sensor refresh intervals, offline heartbeats, battery alerts, and bin status thresholds.
        </p>
      </div>

      {/* Live Monitoring Toggles */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Enable Live Bin Monitoring</span>
            <span className="text-[11px] text-slate-500">Real-time IoT fill telemetry ingestion across all smart bins</span>
          </div>
          <input
            type="checkbox"
            checked={data.enableLiveMonitoring}
            onChange={(e) => handleChange('enableLiveMonitoring', e.target.checked)}
            className="w-5 h-5 rounded text-[#047857] focus:ring-0 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Telemetry Refresh Interval (Seconds)</label>
            <input
              type="number"
              min={5}
              max={300}
              value={data.refreshIntervalSeconds}
              onChange={(e) => handleChange('refreshIntervalSeconds', Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#047857]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Sensor Offline Threshold (Minutes)</label>
            <input
              type="number"
              min={5}
              max={120}
              value={data.offlineThresholdMinutes}
              onChange={(e) => handleChange('offlineThresholdMinutes', Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#047857]"
            />
          </div>
        </div>
      </div>

      {/* Battery & Health Rules */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center space-x-2">
          <Battery className="w-4 h-4 text-emerald-600" />
          <span>Sensor Battery & Health Alert Rules</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Battery Warning Level (%)</label>
            <input
              type="number"
              min={15}
              max={50}
              value={data.batteryWarningPercent}
              onChange={(e) => handleChange('batteryWarningPercent', Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-amber-800 focus:outline-none focus:border-[#047857]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Battery Critical Level (%)</label>
            <input
              type="number"
              min={5}
              max={20}
              value={data.batteryCriticalPercent}
              onChange={(e) => handleChange('batteryCriticalPercent', Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-red-700 focus:outline-none focus:border-[#047857]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center space-x-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={data.autoOfflineAlerts}
              onChange={(e) => handleChange('autoOfflineAlerts', e.target.checked)}
              className="rounded text-[#047857] focus:ring-0"
            />
            <span className="text-xs font-bold text-slate-800">Automatic Offline Sensor Alerts</span>
          </label>

          <label className="flex items-center space-x-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={data.autoSensorFaultAlerts}
              onChange={(e) => handleChange('autoSensorFaultAlerts', e.target.checked)}
              className="rounded text-[#047857] focus:ring-0"
            />
            <span className="text-xs font-bold text-slate-800">Automatic Telemetry Fault Alerts</span>
          </label>
        </div>
      </div>

      {/* Visual Status Threshold Preview */}
      <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 m-0">
          Bin Status Visual Preview
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-center">
          <div className="p-2 bg-emerald-950/80 border border-emerald-500/40 rounded text-emerald-300">
            <span className="block text-[10px] uppercase font-bold text-emerald-400">Normal</span>
            <strong>&lt; {data.warningFillThreshold}%</strong>
          </div>

          <div className="p-2 bg-amber-950/80 border border-amber-500/40 rounded text-amber-300">
            <span className="block text-[10px] uppercase font-bold text-amber-400">Warning</span>
            <strong>{data.warningFillThreshold}–{data.criticalFillThreshold - 1}%</strong>
          </div>

          <div className="p-2 bg-red-950/80 border border-red-500/40 rounded text-red-300">
            <span className="block text-[10px] uppercase font-bold text-red-400">Critical</span>
            <strong>{data.criticalFillThreshold}–100%</strong>
          </div>

          <div className="p-2 bg-slate-800 border border-slate-700 rounded text-slate-400">
            <span className="block text-[10px] uppercase font-bold text-slate-300">Offline</span>
            <strong>&gt; {data.offlineThresholdMinutes}m No Signals</strong>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BinMonitoringSection;
