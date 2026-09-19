import React from 'react';
import { AlertCircle } from 'lucide-react';

export const DemandOverview: React.FC = () => {
  // Demand timeline data points for SVG Chart
  const timePoints = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '00:00'];
  const currentDemand = [3.2, 4.8, 6.1, 8.4, 7.2, 4.5, 2.8];
  const predictedDemand = [3.8, 5.2, 7.0, 9.6, 8.1, 5.0, 3.1];

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const maxVal = 12;

  const pointsToSvg = (arr: number[]) => {
    return arr
      .map((val, idx) => {
        const x = (idx / (arr.length - 1)) * (svgWidth - 60) + 30;
        const y = svgHeight - (val / maxVal) * (svgHeight - 40) - 20;
        return `${x},${y}`;
      })
      .join(' ');
  };

  const currentPath = pointsToSvg(currentDemand);
  const predictedPath = pointsToSvg(predictedDemand);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">Collection Demand Overview</h3>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
              AI Forecast — Simulated
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Analyze current and predicted waste demand before generating the collection plan.
          </p>
        </div>
      </div>

      {/* Main Grid: Chart + Demand Summary Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Area/Line Chart (2 cols) */}
        <div className="lg:col-span-2 bg-slate-950 text-white rounded-xl p-5 border border-slate-800 relative flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-slate-300 font-semibold">Current Demand</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-emerald-300 rounded-full border border-dashed border-emerald-400" />
                <span className="text-emerald-400 font-semibold">Predicted Demand</span>
              </div>
            </div>
            <span className="text-slate-400 font-mono">Expected Peak: 15:00 – 18:00</span>
          </div>

          {/* SVG Canvas */}
          <div className="relative w-full h-[200px] flex items-center justify-center">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
              
              {/* Grid Lines */}
              {[0, 3, 6, 9, 12].map((val) => {
                const y = svgHeight - (val / maxVal) * (svgHeight - 40) - 20;
                return (
                  <g key={val}>
                    <line x1="30" y1={y} x2={svgWidth - 30} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                    <text x="10" y={y + 4} fill="#64748b" fontSize="10" fontFamily="monospace">
                      {val}t
                    </text>
                  </g>
                );
              })}

              {/* Area Fill for Predicted */}
              <polygon
                points={`30,${svgHeight - 20} ${predictedPath} ${svgWidth - 30},${svgHeight - 20}`}
                fill="rgba(16, 185, 129, 0.12)"
              />

              {/* Predicted Demand Line */}
              <polyline
                fill="none"
                stroke="#34d399"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                points={predictedPath}
              />

              {/* Current Demand Line */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                points={currentPath}
              />

              {/* Peak Marker Highlight */}
              <circle cx="390" cy="55" r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
              <text x="402" y="52" fill="#fbbf24" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                Peak 9.6t
              </text>
            </svg>
          </div>

          {/* X Axis Timeline Labels */}
          <div className="flex justify-between text-slate-400 text-xs font-mono pt-2 border-t border-slate-800">
            {timePoints.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>

        {/* Demand Summary Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2 mb-3">
              Demand Summary
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Expected Waste:</span>
                <span className="font-bold font-mono text-slate-900">8.4 t</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Expected Increase:</span>
                <span className="font-bold font-mono text-emerald-700">+11.8%</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Peak Collection Window:</span>
                <span className="font-semibold text-slate-900">15:00 – 18:00</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Highest Demand Zone:</span>
                <span className="font-bold text-emerald-800">Central</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Predicted Overflow:</span>
                <span className="font-bold font-mono text-red-600">14 bins</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Highest Risk Zone:</span>
                <span className="font-semibold text-slate-900">Central / Residential</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Demand predicted to spike during afternoon shift window.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
