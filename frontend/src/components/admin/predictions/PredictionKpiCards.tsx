import React from 'react';
import {
  AlertTriangle,
  Flame,
  TrendingUp,
  Weight,
  Award,
  Truck,
} from 'lucide-react';
import type { PredictionKpiSummary } from '../../../types/prediction';

interface PredictionKpiCardsProps {
  kpi: PredictionKpiSummary;
}

export const PredictionKpiCards: React.FC<PredictionKpiCardsProps> = ({ kpi }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
      {/* 1. Bins at Risk */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Bins at Risk</span>
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none font-mono">{kpi.binsAtRisk}</span>
          <span className="text-[10px] font-bold text-amber-700 block mt-1">{kpi.binsAtRiskChange}</span>
        </div>
      </div>

      {/* 2. Predicted Overflow */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Predicted Overflow</span>
          <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
          </div>
        </div>
        <div>
          <span className="text-xl sm:text-2xl font-black text-red-600 leading-none font-mono">{kpi.predictedOverflow}</span>
          <span className="text-[10px] font-bold text-slate-500 block mt-1">{kpi.predictedOverflowWindow}</span>
        </div>
      </div>

      {/* 3. Average Predicted Fill */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Avg Predicted Fill</span>
          <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none font-mono">{kpi.averagePredictedFill}%</span>
          <span className="text-[10px] font-bold text-teal-600 block mt-1">{kpi.averageFillChange}</span>
        </div>
      </div>

      {/* 4. Expected Waste */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Expected Waste</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Weight className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none font-mono">{kpi.expectedWasteTons} t</span>
          <span className="text-[10px] font-bold text-emerald-600 block mt-1">{kpi.expectedWasteChange}</span>
        </div>
      </div>

      {/* 5. Forecast Confidence */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Forecast Confidence</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Award className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <span className="text-xl sm:text-2xl font-black text-[#047857] leading-none font-mono">{kpi.forecastConfidence}%</span>
          <span className="text-[10px] font-bold text-emerald-600 block mt-1">{kpi.confidenceChange}</span>
        </div>
      </div>

      {/* 6. Collection Demand */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Collection Demand</span>
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Truck className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none font-mono">{kpi.collectionDemandBins} bins</span>
          <span className="text-[10px] font-bold text-blue-600 block mt-1">{kpi.collectionDemandWindow}</span>
        </div>
      </div>
    </div>
  );
};
