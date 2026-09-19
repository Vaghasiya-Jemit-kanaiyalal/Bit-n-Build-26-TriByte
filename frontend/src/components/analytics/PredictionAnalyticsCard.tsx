import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import type { OperationalInsightItem, PredictionVsActualPoint } from '../../mock/analyticsMockData';

interface PredictionAnalyticsCardProps {
  predictionVsActual: PredictionVsActualPoint[];
  insights: OperationalInsightItem[];
  onNavigateToPredictions?: () => void;
}

export const PredictionAnalyticsCard: React.FC<PredictionAnalyticsCardProps> = ({
  insights,
  onNavigateToPredictions,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 hover:shadow-xs transition-all h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900 m-0">AI Prediction Performance & Insights</h3>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              SIMULATED TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Machine learning forecast accuracy, confidence scores and operational recommendations
          </p>
        </div>

        {onNavigateToPredictions && (
          <button
            onClick={onNavigateToPredictions}
            className="flex items-center space-x-1 text-xs font-bold text-[#047857] hover:underline cursor-pointer bg-transparent border-none"
          >
            <span>View Predictions</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Top 5 Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5 text-xs">
        <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-lg">
          <span className="text-[10px] text-purple-800 font-bold block uppercase">Predictions Generated</span>
          <strong className="text-xl font-black font-mono text-purple-950">1,248</strong>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Forecast Accuracy</span>
          <strong className="text-xl font-black font-mono text-emerald-700">91.0%</strong>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Avg Confidence</span>
          <strong className="text-xl font-black font-mono text-slate-900">89.2%</strong>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] text-slate-400 font-bold block uppercase">High-Risk Events</span>
          <strong className="text-xl font-black font-mono text-amber-700">87</strong>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Early Warnings</span>
          <strong className="text-xl font-black font-mono text-slate-900">63</strong>
        </div>
      </div>

      {/* AI Operational Insights Cards List */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
          AI Operational Insights & Observations
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((item) => (
            <div key={item.id} className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center space-x-1 font-bold text-[10px] text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>{item.badge}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 m-0">{item.title}</h4>
              <p className="text-[11px] text-slate-600 leading-snug m-0">{item.description}</p>
              <div className="pt-1 text-[10px] font-bold text-slate-500">
                Entity: <strong className="text-slate-800">{item.zoneOrEntity}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default PredictionAnalyticsCard;
