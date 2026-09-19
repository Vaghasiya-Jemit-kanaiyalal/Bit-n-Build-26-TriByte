import React from 'react';
import type { MonitoredSensor } from '../../../types/monitoring';
import { Cpu, Activity } from 'lucide-react';

interface SensorHealthSectionProps {
  sensors: MonitoredSensor[];
}

export const SensorHealthSection: React.FC<SensorHealthSectionProps> = ({ sensors }) => {
  const onlineCount = 236;
  const warningCount = 8;
  const offlineCount = 4;
  const totalCount = 248;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            IoT Sensor Network Health &amp; Telemetry
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-slate-500">
          94.7% Network Health
        </span>
      </div>

      {/* Sensor Health Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Total Sensors</p>
          <p className="text-lg font-extrabold font-mono text-slate-900">{totalCount}</p>
        </div>
        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
          <p className="text-[10px] font-bold text-emerald-800 uppercase">Online Connected</p>
          <p className="text-lg font-extrabold font-mono text-emerald-950">{onlineCount}</p>
        </div>
        <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
          <p className="text-[10px] font-bold text-amber-800 uppercase">Warning State</p>
          <p className="text-lg font-extrabold font-mono text-amber-950">{warningCount}</p>
        </div>
        <div className="bg-red-50 p-2.5 rounded-xl border border-red-200">
          <p className="text-[10px] font-bold text-red-800 uppercase">Offline Disconnected</p>
          <p className="text-lg font-extrabold font-mono text-red-950">{offlineCount}</p>
        </div>
      </div>

      {/* Simulated 30-Min Telemetry Graph */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-purple-600" />
            <span>30-Minute Network Telemetry Trend (Fill &amp; Battery)</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
        </div>

        {/* SVG Sparkline Graph */}
        <div className="h-20 w-full relative pt-2">
          <svg className="w-full h-full" viewBox="0 0 400 60" preserveAspectRatio="none">
            {/* Fill Level Line */}
            <path
              d="M 0 45 Q 50 40, 100 38 T 200 32 T 300 24 T 400 15"
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
            />
            {/* Battery Line */}
            <path
              d="M 0 15 Q 50 16, 100 18 T 200 20 T 300 22 T 400 25"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeDasharray="4,2"
            />
          </svg>
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>-30 min</span>
          <span>-15 min</span>
          <span>Just now</span>
        </div>
      </div>

      {/* Sensor Health Sample Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-200">
              <th className="p-2">Sensor ID</th>
              <th className="p-2">Assigned Bin</th>
              <th className="p-2">Battery</th>
              <th className="p-2">Signal</th>
              <th className="p-2">Last Update</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {sensors.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/80">
                <td className="p-2 font-bold text-slate-900">{s.id}</td>
                <td className="p-2 text-slate-700">{s.binId}</td>
                <td className="p-2">
                  <span className={s.batteryPercent < 30 ? 'text-red-600 font-bold' : 'text-slate-700'}>
                    {s.batteryPercent}%
                  </span>
                </td>
                <td className="p-2 text-slate-600">{s.signalStrength}</td>
                <td className="p-2 text-slate-500">{s.lastUpdate}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === 'Online'
                        ? 'bg-emerald-100 text-emerald-800'
                        : s.status === 'Warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
