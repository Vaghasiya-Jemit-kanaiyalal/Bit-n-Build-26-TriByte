import React from 'react';
import { Clock } from 'lucide-react';
import type { CollectionWindow } from '../../../types/planning';

interface CollectionWindowsSectionProps {
  windows: CollectionWindow[];
  selectedWindow: string;
  onSelectWindow: (window: string) => void;
}

export const CollectionWindowsSection: React.FC<CollectionWindowsSectionProps> = ({
  windows,
  selectedWindow,
  onSelectWindow,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center">
            <Clock className="w-5 h-5 mr-2 text-emerald-400" />
            Collection Windows
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Select a preferred operational dispatch window based on traffic risk, expected tonnage, and bin volume.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold px-3 py-1 bg-slate-800 text-emerald-400 border border-slate-700 rounded-full">
          Recommended: 15:00 – 18:00
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-200">
        {windows.map((w) => {
          const winName = w.window || w.windowLabel || 'Window';
          const isSelected = selectedWindow === winName;
          const risk = w.riskLevel || w.risk || 'Low';

          return (
            <div
              key={w.id}
              onClick={() => onSelectWindow(winName)}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50/50 border-l-4 border-l-emerald-600'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="collectionWindow"
                  checked={isSelected}
                  onChange={() => onSelectWindow(winName)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold font-mono text-sm text-slate-900">{winName}</span>
                    {w.isRecommended && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        RECOMMENDED PEAK WINDOW
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">
                    {w.expectedBins} expected bins • {w.expectedWasteTons} tons waste
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Vehicles Req.</span>
                  <span className="font-bold text-slate-800">{w.vehiclesRequired} fleet</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Avail. Capacity</span>
                  <span className="font-bold text-emerald-700">{w.availableCapacityTons} t</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Risk Level</span>
                  <span className={`font-bold ${
                    risk === 'Low' ? 'text-emerald-600' :
                    risk === 'Medium' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {risk}
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
