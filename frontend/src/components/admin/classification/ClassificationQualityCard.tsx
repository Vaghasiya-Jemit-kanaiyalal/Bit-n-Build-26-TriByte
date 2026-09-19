import React from 'react';
import type { ClassificationModel } from '../../../types/classification';
import { Target, Info } from 'lucide-react';

interface ClassificationQualityCardProps {
  model: ClassificationModel;
}

export const ClassificationQualityCard: React.FC<ClassificationQualityCardProps> = ({ model }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">AI Classification Quality Metrics</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Benchmark Metrics</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center font-mono">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold font-sans uppercase block mb-1">Accuracy</span>
          <span className="text-xl font-extrabold text-slate-900">{model.accuracy}%</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold font-sans uppercase block mb-1">Precision</span>
          <span className="text-xl font-extrabold text-emerald-700">{model.precision}%</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold font-sans uppercase block mb-1">Recall</span>
          <span className="text-xl font-extrabold text-blue-700">{model.recall}%</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold font-sans uppercase block mb-1">F1 Score</span>
          <span className="text-xl font-extrabold text-purple-700">{model.f1Score}%</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold font-sans uppercase block mb-1">High Conf Rate</span>
          <span className="text-xl font-extrabold text-emerald-800">{model.highConfidenceRate}%</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold font-sans uppercase block mb-1">Manual Fix Rate</span>
          <span className="text-xl font-extrabold text-amber-700">{model.manualCorrectionRate}%</span>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2 text-slate-500 text-[11px] leading-relaxed">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong>Demo Note:</strong> Model performance metrics shown here are demonstration values.
        </span>
      </div>
    </div>
  );
};
