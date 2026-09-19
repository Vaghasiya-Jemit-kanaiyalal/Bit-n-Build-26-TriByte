import React from 'react';
import { Cpu, CheckCircle2 } from 'lucide-react';
import type { PredictionModelInfo } from '../../../types/prediction';

interface PredictionModelCardProps {
  model: PredictionModelInfo;
}

export const PredictionModelCard: React.FC<PredictionModelCardProps> = ({ model }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-slate-900">{model.modelName}</span>
            <span className="text-xs text-slate-500 font-mono">Version {model.version} &bull; Mode: {model.mode}</span>
          </div>
        </div>
        <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{model.status}</span>
        </span>
      </div>

      <div className="space-y-2.5 text-xs font-medium text-slate-600">
        <div className="flex items-center justify-between">
          <span>Target Variable:</span>
          <span className="font-bold text-slate-900">{model.target}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Supported Horizons:</span>
          <div className="flex gap-1">
            {model.horizons.map((h, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold">
                {h}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1 pt-1">
          <span className="font-bold text-slate-900">Features Included:</span>
          <div className="flex flex-wrap gap-1">
            {model.featuresUsed.map((f, i) => (
              <span key={i} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                {f}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
          <span>Last Model Retrain:</span>
          <span className="font-mono text-slate-600">{model.lastModelUpdate}</span>
        </div>
      </div>
    </div>
  );
};
