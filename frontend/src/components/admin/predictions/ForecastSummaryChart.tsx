import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import type { ForecastTimeSeriesPoint } from '../../../types/prediction';

interface ForecastSummaryChartProps {
  points: ForecastTimeSeriesPoint[];
}

export const ForecastSummaryChart: React.FC<ForecastSummaryChartProps> = ({ points }) => {
  const [showCurrent, setShowCurrent] = useState<boolean>(true);
  const [showPredicted, setShowPredicted] = useState<boolean>(true);
  const [showWarning, setShowWarning] = useState<boolean>(true);
  const [showCritical, setShowCritical] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<ForecastTimeSeriesPoint | null>(null);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 m-0">24-Hour Fill Level Forecast Summary</h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Network average fill percentage baseline vs AI predicted fill trajectory.
          </p>
        </div>

        {/* Metric Toggles */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold">
          <button
            onClick={() => setShowCurrent(!showCurrent)}
            className={`px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
              showCurrent
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            Current Fill
          </button>
          <button
            onClick={() => setShowPredicted(!showPredicted)}
            className={`px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
              showPredicted
                ? 'bg-[#047857] text-white border-[#047857]'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            Predicted Fill
          </button>
          <button
            onClick={() => setShowWarning(!showWarning)}
            className={`px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
              showWarning
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            Warning (75%)
          </button>
          <button
            onClick={() => setShowCritical(!showCritical)}
            className={`px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
              showCritical
                ? 'bg-red-100 text-red-700 border-red-300'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            Critical (90%)
          </button>
        </div>
      </div>

      {/* SVG Time-Series Chart */}
      <div className="relative w-full h-64 bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
        {/* Horizontal Threshold Reference Lines */}
        {showCritical && (
          <div className="absolute left-0 right-0 top-[10%] border-b border-dashed border-red-400 flex items-center justify-between px-3">
            <span className="text-[10px] font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
              CRITICAL 90%
            </span>
          </div>
        )}
        {showWarning && (
          <div className="absolute left-0 right-0 top-[25%] border-b border-dashed border-amber-400 flex items-center justify-between px-3">
            <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              WARNING 75%
            </span>
          </div>
        )}

        {/* SVG Curve Plot */}
        <svg className="w-full h-44 overflow-visible">
          {/* Grid Lines */}
          <line x1="0" y1="0" x2="100%" y2="0" stroke="#e2e8f0" strokeDasharray="4 4" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e2e8f0" strokeDasharray="4 4" />
          <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#e2e8f0" />

          {/* Current Fill Line (Dark Slate) */}
          {showCurrent && (
            <polyline
              fill="none"
              stroke="#1e293b"
              strokeWidth="3"
              points={points
                .map((p, i) => `${(i / (points.length - 1)) * 100}%,${100 - p.currentFill}%`)
                .join(' ')}
            />
          )}

          {/* Predicted Fill Line (Emerald Green) */}
          {showPredicted && (
            <polyline
              fill="none"
              stroke="#047857"
              strokeWidth="3.5"
              strokeDasharray="6 3"
              points={points
                .map((p, i) => `${(i / (points.length - 1)) * 100}%,${100 - p.predictedFill}%`)
                .join(' ')}
            />
          )}

          {/* Data Nodes */}
          {points.map((p, i) => {
            const xPercent = (i / (points.length - 1)) * 100;
            const yCurrent = 100 - p.currentFill;
            const yPredicted = 100 - p.predictedFill;
            return (
              <g key={i}>
                {showCurrent && (
                  <circle
                    cx={`${xPercent}%`}
                    cy={`${yCurrent}%`}
                    r="5"
                    className="fill-slate-900 stroke-white stroke-2 hover:r-7 transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(p)}
                  />
                )}
                {showPredicted && (
                  <circle
                    cx={`${xPercent}%`}
                    cy={`${yPredicted}%`}
                    r="5"
                    className="fill-[#047857] stroke-white stroke-2 hover:r-7 transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(p)}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* X-Axis Labels */}
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-2 border-t border-slate-200">
          {points.map((p, i) => (
            <span key={i}>{p.timeLabel}</span>
          ))}
        </div>
      </div>

      {/* Tooltip Hover Banner */}
      {hoveredPoint && (
        <div className="mt-3 p-3 bg-slate-900 text-white rounded-xl text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-emerald-400">{hoveredPoint.timeLabel}</span>
            <span>Current: <strong>{hoveredPoint.currentFill}%</strong></span>
            <span>Predicted: <strong className="text-emerald-400">{hoveredPoint.predictedFill}%</strong></span>
          </div>
          <span className="text-slate-400 text-[10px] font-mono">Confidence: {hoveredPoint.confidence}%</span>
        </div>
      )}
    </div>
  );
};
