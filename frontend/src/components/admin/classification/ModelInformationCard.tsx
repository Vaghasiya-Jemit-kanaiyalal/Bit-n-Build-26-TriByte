import React from 'react';
import type { ClassificationModel } from '../../../types/classification';
import { Cpu } from 'lucide-react';

interface ModelInformationCardProps {
  model: ClassificationModel;
}

export const ModelInformationCard: React.FC<ModelInformationCardProps> = ({ model }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">AI Classification Model Architecture</h3>
        </div>
        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider font-mono">
          Status: {model.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Model Specification</span>
          <p className="font-bold text-slate-900">{model.name}</p>
          <p className="font-mono text-[11px] text-slate-500">Version: {model.version}</p>
          <p className="font-mono text-[11px] text-slate-500">Last Synced: {model.lastUpdated}</p>
        </div>

        <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Supported Classes ({model.supportedClassesCount})</span>
          <div className="flex flex-wrap gap-1 font-mono text-[11px]">
            {model.classes.map((cls) => (
              <span key={cls} className="bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-slate-800">
                ✓ {cls}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Execution Environment</span>
          <p className="font-mono text-[11px] text-slate-700">Mode: <strong>{model.predictionMode}</strong></p>
          <p className="font-mono text-[11px] text-slate-700">Min Audit Confidence: <strong>{model.minReviewConfidence}%</strong></p>
          <p className="text-[10px] text-slate-400">FastAPI ML integration ready endpoint</p>
        </div>
      </div>
    </div>
  );
};
