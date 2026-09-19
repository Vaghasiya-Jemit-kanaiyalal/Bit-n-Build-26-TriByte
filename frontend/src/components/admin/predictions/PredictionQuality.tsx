import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { PredictionQualityMetrics } from '../../../types/prediction';

interface PredictionQualityProps {
  quality: PredictionQualityMetrics;
}

export const PredictionQuality: React.FC<PredictionQualityProps> = ({ quality }) => {
  return (
    <div className="space-y-6">
      {/* Disclaimer Alert Banner */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">Demonstration Model Performance Notice</span>
          <p className="text-xs text-amber-900 font-medium mt-0.5 leading-relaxed">
            {quality.disclaimer}
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Forecast Accuracy</span>
          <span className="text-2xl font-mono font-extrabold text-[#047857] mt-2">{quality.forecastAccuracy}%</span>
          <span className="text-[10px] text-emerald-600 font-bold mt-1">↑ +0.6% this week</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Mean Abs Error (MAE)</span>
          <span className="text-2xl font-mono font-extrabold text-slate-900 mt-2">{quality.mae}%</span>
          <span className="text-[10px] text-slate-500 font-medium mt-1">Target &lt; 5.0%</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Root Mean Sq Err (RMSE)</span>
          <span className="text-2xl font-mono font-extrabold text-slate-900 mt-2">{quality.rmse}%</span>
          <span className="text-[10px] text-slate-500 font-medium mt-1">Target &lt; 7.0%</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Mean Abs Pct Err (MAPE)</span>
          <span className="text-2xl font-mono font-extrabold text-slate-900 mt-2">{quality.mape}%</span>
          <span className="text-[10px] text-slate-500 font-medium mt-1">Target &lt; 6.0%</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">High Conf Score</span>
          <span className="text-2xl font-mono font-extrabold text-emerald-700 mt-2">{quality.highConfidencePercentage}%</span>
          <span className="text-[10px] text-emerald-600 font-bold mt-1">&ge; 90% confidence</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Prediction Coverage</span>
          <span className="text-2xl font-mono font-extrabold text-blue-700 mt-2">{quality.predictionCoverage}%</span>
          <span className="text-[10px] text-blue-600 font-bold mt-1">238 of 247 bins</span>
        </div>
      </div>

      {/* Accuracy Trend Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 m-0">7-Day Model Accuracy & Error Rate Trend</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Historical daily validation accuracy vs prediction error percentage.</p>
          </div>
        </div>

        <div className="relative w-full h-44 bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-end justify-between gap-4">
          {quality.accuracyTrend.map((pt, i) => {
            const accHeight = ((pt.accuracy - 85) / 15) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                <div className="w-full flex items-end justify-center h-28">
                  <div
                    style={{ height: `${accHeight}%` }}
                    className="w-full max-w-[28px] bg-emerald-600 rounded-t-md hover:bg-emerald-500 transition-all relative"
                  >
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      Acc: {pt.accuracy}% (Err: {pt.error}%)
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-600 mt-1">{pt.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
