import React from 'react';
import { Cpu, CheckCircle2, Pause, Play } from 'lucide-react';
import type { PredictionEngineStatus as StatusType } from '../../../types/prediction';

interface PredictionEngineStatusProps {
  status: StatusType;
  isLive: boolean;
  onToggleLive: () => void;
}

export const PredictionEngineStatus: React.FC<PredictionEngineStatusProps> = ({
  status,
  isLive,
  onToggleLive,
}) => {
  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
      {/* Engine Status & Version */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center justify-center shrink-0">
          <Cpu className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Prediction Engine</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{status.status}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-medium">
            <span className="font-mono text-slate-200">{status.modelName}</span>
            <span>&bull;</span>
            <span className="font-mono text-emerald-400 font-bold">{status.modelVersion}</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs w-full md:w-auto">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">Generated</span>
          <span className="font-mono text-sm font-extrabold text-white">{status.predictionsGenerated.toLocaleString()}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">Avg Confidence</span>
          <span className="font-mono text-sm font-extrabold text-emerald-400">{status.averageConfidence}%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">Last Run</span>
          <span className="font-mono text-xs font-bold text-slate-300">{status.lastPredictionRun}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">Horizon</span>
          <span className="font-mono text-xs font-bold text-slate-300">{status.horizon}</span>
        </div>
      </div>

      {/* Live Simulation Pulse & Toggle */}
      <div className="flex items-center gap-3 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'}`} />
          <span className="text-xs font-bold text-slate-300">{isLive ? 'LIVE' : 'PAUSED'}</span>
        </div>
        <button
          onClick={onToggleLive}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border transition-colors ${
            isLive
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-500 border-emerald-500'
          }`}
        >
          {isLive ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Updates</span>
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
