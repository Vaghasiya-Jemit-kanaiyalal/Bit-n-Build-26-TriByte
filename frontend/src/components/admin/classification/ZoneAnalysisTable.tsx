import React from 'react';
import type { ZoneClassification } from '../../../types/classification';
import { MapPin, BarChart3, ChevronRight } from 'lucide-react';

interface ZoneAnalysisTableProps {
  zones: ZoneClassification[];
  onSelectZone: (zone: ZoneClassification) => void;
}

export const ZoneAnalysisTable: React.FC<ZoneAnalysisTableProps> = ({ zones, onSelectZone }) => {
  return (
    <div className="space-y-4">
      {/* Zone Waste Composition Stacked Bar Graphic */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Waste Material Composition by Zone</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Stacked Zone Stream Distribution</span>
        </div>

        <div className="space-y-3 pt-2">
          {zones.map((z) => {
            const plasticPct = Math.round((z.plasticTons / z.totalWasteTons) * 100);
            const paperPct = Math.round((z.paperTons / z.totalWasteTons) * 100);
            const metalPct = Math.round((z.metalTons / z.totalWasteTons) * 100);
            const glassPct = Math.round((z.glassTons / z.totalWasteTons) * 100);
            const organicPct = Math.round((z.organicTons / z.totalWasteTons) * 100);
            const otherPct = Math.max(100 - (plasticPct + paperPct + metalPct + glassPct + organicPct), 0);

            return (
              <div key={z.zone} className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-mono font-medium">
                  <span className="font-bold font-sans text-slate-900">{z.zone}</span>
                  <span className="text-slate-600">
                    Total: <strong className="text-slate-900">{z.totalWasteTons}t</strong> • Recyclable:{' '}
                    <strong className="text-emerald-700">{z.recyclablePercent}%</strong>
                  </span>
                </div>

                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-xs cursor-pointer" onClick={() => onSelectZone(z)}>
                  <div style={{ width: `${organicPct}%` }} className="bg-emerald-500" title={`Organic: ${z.organicTons}t`} />
                  <div style={{ width: `${plasticPct}%` }} className="bg-blue-500" title={`Plastic: ${z.plasticTons}t`} />
                  <div style={{ width: `${paperPct}%` }} className="bg-amber-500" title={`Paper: ${z.paperTons}t`} />
                  <div style={{ width: `${metalPct}%` }} className="bg-slate-500" title={`Metal: ${z.metalTons}t`} />
                  <div style={{ width: `${glassPct}%` }} className="bg-purple-500" title={`Glass: ${z.glassTons}t`} />
                  <div style={{ width: `${otherPct}%` }} className="bg-red-500" title={`Other: ${z.otherTons}t`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zone Details Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Zone Classification Breakdown Table</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Click row for Zone Classification Drawer</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Zone</th>
                <th className="pb-3 text-right">Total Waste</th>
                <th className="pb-3 text-right">Plastic</th>
                <th className="pb-3 text-right">Paper</th>
                <th className="pb-3 text-right">Metal</th>
                <th className="pb-3 text-right">Glass</th>
                <th className="pb-3 text-right">Organic</th>
                <th className="pb-3 text-right">Other</th>
                <th className="pb-3 text-right">Recyclable %</th>
                <th className="pb-3">Top Category</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium font-mono">
              {zones.map((z) => (
                <tr
                  key={z.zone}
                  onClick={() => onSelectZone(z)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors font-mono"
                >
                  <td className="py-3 font-bold font-sans text-slate-900">{z.zone}</td>
                  <td className="py-3 text-right font-bold text-slate-900">{z.totalWasteTons} t</td>
                  <td className="py-3 text-right text-blue-700">{z.plasticTons} t</td>
                  <td className="py-3 text-right text-amber-700">{z.paperTons} t</td>
                  <td className="py-3 text-right text-slate-700">{z.metalTons} t</td>
                  <td className="py-3 text-right text-purple-700">{z.glassTons} t</td>
                  <td className="py-3 text-right text-emerald-700">{z.organicTons} t</td>
                  <td className="py-3 text-right text-red-600">{z.otherTons} t</td>
                  <td className="py-3 text-right font-bold text-emerald-700">{z.recyclablePercent}%</td>
                  <td className="py-3 font-sans">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold text-[11px]">
                      {z.topCategory}
                    </span>
                  </td>
                  <td className="py-3 text-right font-sans">
                    <button className="text-slate-400 hover:text-slate-900 p-1 rounded hover:bg-slate-100">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
