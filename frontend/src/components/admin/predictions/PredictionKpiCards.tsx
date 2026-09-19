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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* 1. Bins at Risk */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bins at Risk</span>
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-extrabold text-slate-900 leading-none">{kpi.binsAtRisk}</span>
          <span className="text-[10px] font-bold text-amber-700 block mt-1">{kpi.binsAtRiskChange}</span>
        </div>
      </div>

      {/* 2. Predicted Overflow */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Predicted Overflow</span>
          <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-extrabold text-red-600 leading-none">{kpi.predictedOverflow}</span>
          <span className="text-[10px] font-bold text-slate-500 block mt-1">{kpi.predictedOverflowWindow}</span>
        </div>
      </div>

      {/* 3. Average Predicted Fill */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Predicted Fill</span>
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-extrabold text-slate-900 leading-none">{kpi.averagePredictedFill}%</span>
          <span className="text-[10px] font-bold text-teal-600 block mt-1">{kpi.averageFillChange}</span>
        </div>
      </div>

      {/* 4. Expected Waste */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expected Waste</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Weight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-extrabold text-slate-900 leading-none">{kpi.expectedWasteTons} t</span>
          <span className="text-[10px] font-bold text-emerald-600 block mt-1">{kpi.expectedWasteChange}</span>
        </div>
      </div>

      {/* 5. Forecast Confidence */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Forecast Confidence</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-extrabold text-[#047857] leading-none">{kpi.forecastConfidence}%</span>
          <span className="text-[10px] font-bold text-emerald-600 block mt-1">{kpi.confidenceChange}</span>
        </div>
      </div>

      {/* 6. Collection Demand */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Collection Demand</span>
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-extrabold text-slate-900 leading-none">{kpi.collectionDemandBins} bins</span>
          <span className="text-[10px] font-bold text-blue-600 block mt-1">{kpi.collectionDemandWindow}</span>
        </div>
      </div>
    </div>
  );
};
