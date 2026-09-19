import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { WasteTrendPoint } from '../../mock/analyticsMockData';

interface WasteTrendChartProps {
  data: WasteTrendPoint[];
}

export const WasteTrendChart: React.FC<WasteTrendChartProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => Math.max(d.generated, d.collected, d.predicted))) * 1.15;
  const minVal = Math.min(...data.map(d => Math.min(d.generated, d.collected))) * 0.85;

  const chartHeight = 180;
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 20;

  const getX = (index: number) => {
    return paddingX + (index / (data.length - 1)) * (chartWidth - paddingX * 2);
  };

  const getY = (val: number) => {
    const norm = (val - minVal) / (maxVal - minVal);
    return chartHeight - paddingY - norm * (chartHeight - paddingY * 2);
  };

  // Generate SVG path strings
  const genPoints = data.map((d, i) => `${getX(i)},${getY(d.generated)}`).join(' L ');
  const colPoints = data.map((d, i) => `${getX(i)},${getY(d.collected)}`).join(' L ');

  const peakPoint = [...data].sort((a, b) => b.generated - a.generated)[0];
  const lowestPoint = [...data].sort((a, b) => a.generated - b.generated)[0];
  const avgGen = Math.round((data.reduce((acc, d) => acc + d.generated, 0) / data.length) * 10) / 10;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 hover:shadow-xs transition-all h-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900 m-0">Waste Generation & Collection Trend</h3>
            <span className="text-[10px] font-bold text-[#047857] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              DAILY TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Total tonnage generated vs collected by fleet across selected time window
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-emerald-600 rounded-full" />
            <span className="text-slate-700">Generated</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-blue-600 rounded-full" />
            <span className="text-slate-700">Collected</span>
          </div>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 mb-4 text-xs">
        <div>
          <span className="text-slate-400 font-medium text-[10px] block uppercase">Peak Generation</span>
          <strong className="text-slate-900 font-mono text-sm">{peakPoint.generated} t</strong>
          <span className="text-[10px] text-slate-500 ml-1.5">({peakPoint.date})</span>
        </div>
        <div>
          <span className="text-slate-400 font-medium text-[10px] block uppercase">Average Daily</span>
          <strong className="text-slate-900 font-mono text-sm">{avgGen} t/day</strong>
        </div>
        <div>
          <span className="text-slate-400 font-medium text-[10px] block uppercase">Lowest Generation</span>
          <strong className="text-slate-900 font-mono text-sm">{lowestPoint.generated} t</strong>
          <span className="text-[10px] text-slate-500 ml-1.5">({lowestPoint.date})</span>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-48 overflow-visible"
        >
          {/* Horizontal Grid lines */}
          {[minVal, (minVal + maxVal) / 2, maxVal].map((val, idx) => {
            const y = getY(val);
            return (
              <g key={idx}>
                <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#f1f5f9" strokeDasharray="4 4" />
                <text x={paddingX - 8} y={y + 3} textAnchor="end" className="text-[9px] fill-slate-400 font-mono">
                  {Math.round(val)}t
                </text>
              </g>
            );
          })}

          {/* Lines */}
          <path d={`M ${genPoints}`} fill="none" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M ${colPoints}`} fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="5 3" strokeLinecap="round" />

          {/* Interactive Data Points */}
          {data.map((d, i) => {
            const x = getX(i);
            const yGen = getY(d.generated);
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <circle cx={x} cy={yGen} r={isHovered ? 5 : 3} className={`${isHovered ? 'fill-emerald-700 stroke-white stroke-2' : 'fill-emerald-600'}`} />
                {/* X-axis Labels */}
                {i % 3 === 0 && (
                  <text x={x} y={chartHeight - 4} textAnchor="middle" className="text-[9px] fill-slate-400 font-mono">
                    {d.date.replace('Sep ', '')}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && (
          <div
            className="absolute z-20 bg-slate-900 text-white text-[11px] p-2.5 rounded-lg shadow-xl border border-slate-700 pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(hoveredIdx / (data.length - 1)) * 90 + 5}%`,
              top: '40%',
            }}
          >
            <div className="font-bold border-b border-slate-700 pb-1 mb-1 text-slate-300">
              {data[hoveredIdx].date}
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-emerald-400 font-medium">Generated:</span>
              <span className="font-mono font-bold">{data[hoveredIdx].generated} t</span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-blue-400 font-medium">Collected:</span>
              <span className="font-mono font-bold">{data[hoveredIdx].collected} t</span>
            </div>
          </div>
        )}
      </div>

      {/* Analytic Insight Box */}
      <div className="mt-4 p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg flex items-start space-x-2.5">
        <Sparkles className="w-4 h-4 text-[#047857] shrink-0 mt-0.5" />
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#047857] block">
            ANALYTIC INSIGHT
          </span>
          <p className="text-xs text-slate-800 font-semibold m-0 leading-snug">
            Average daily waste generation increased 8.4% compared with the previous period. Central and Industrial zones recorded highest weekend volume spikes.
          </p>
        </div>
      </div>

    </div>
  );
};

export default WasteTrendChart;
