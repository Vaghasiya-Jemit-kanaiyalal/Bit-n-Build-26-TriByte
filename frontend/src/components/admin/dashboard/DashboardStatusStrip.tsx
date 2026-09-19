import React from 'react';
import { Activity, Pause, Play, Wifi } from 'lucide-react';
import type { DashboardStatusStrip as StatusStripType } from '../../../types/dashboard';

interface DashboardStatusStripProps {
  status: StatusStripType;
  onToggleLive: () => void;
}

export const DashboardStatusStrip: React.FC<DashboardStatusStripProps> = ({
  status,
  onToggleLive,
}) => {
  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
      {/* System Status Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">SYSTEM STATUS</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Real-time network infrastructure health check</span>
        </div>
      </div>

      {/* Compact Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs w-full md:w-auto">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">Network</span>
          <span className="font-mono text-xs font-extrabold text-emerald-400 flex items-center gap-1">
            <Wifi className="w-3 h-3 text-emerald-400" />
            {status.networkStatus}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">Bin Sensors</span>
          <span className="font-mono text-xs font-extrabold text-emerald-400">{status.binSensorsHealth}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">Fleet</span>
          <span className="font-mono text-xs font-extrabold text-emerald-400">{status.fleetStatus}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">Route Engine</span>
          <span className="font-mono text-xs font-extrabold text-emerald-400">{status.routeEngineStatus}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">AI Prediction</span>
          <span className="font-mono text-xs font-extrabold text-emerald-400">{status.aiPredictionStatus}</span>
        </div>
      </div>

      {/* Simulation Stream Controls */}
      <div className="flex items-center gap-3 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${status.isLive ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'}`} />
          <span className="text-xs font-bold text-slate-300">{status.isLive ? 'LIVE' : 'PAUSED'}</span>
        </div>
        <button
          onClick={onToggleLive}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border transition-colors ${
            status.isLive
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-500 border-emerald-500'
          }`}
        >
          {status.isLive ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Stream</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Resume Stream</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
