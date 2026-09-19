import React from 'react';
import { ShieldCheck, Cpu, Radio, BrainCircuit, Database } from 'lucide-react';

export const NetworkHealthBar: React.FC = () => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-4 text-xs">
      <div className="flex items-center gap-2 font-bold">
        <ShieldCheck className="w-5 h-5 text-emerald-400" />
        <span className="text-sm font-extrabold tracking-tight">System &amp; Infrastructure Health Status</span>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">API Gateway:</span>
          <span className="text-emerald-400 font-bold">Healthy (12ms)</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Sensor Network:</span>
          <span className="text-emerald-400 font-bold">94.7% Online</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Vehicle GPS:</span>
          <span className="text-emerald-400 font-bold">100% Signal</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
          <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">ML Prediction Engine:</span>
          <span className="text-emerald-400 font-bold">Healthy</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Telemetry DB:</span>
          <span className="text-emerald-400 font-bold">Connected</span>
        </div>
      </div>
    </div>
  );
};
