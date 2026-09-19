import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LoadProgressProps {
  currentLoad?: number;
  capacity?: number;
  currentLoadKg?: number;
  capacityKg?: number;
  showDetails?: boolean;
}

export const LoadProgress: React.FC<LoadProgressProps> = ({
  currentLoad,
  capacity,
  currentLoadKg,
  capacityKg,
}) => {
  const load = currentLoadKg ?? currentLoad ?? 0;
  const cap = capacityKg ?? capacity ?? 1000;
  const percent = Math.min(Math.round((load / cap) * 100), 100);

  let colorClass = 'bg-[#738a62]';
  let textClass = 'text-emerald-800';
  let isCritical = false;

  if (percent > 90) {
    colorClass = 'bg-red-600';
    textClass = 'text-red-700 font-extrabold';
    isCritical = true;
  } else if (percent >= 70) {
    colorClass = 'bg-amber-500';
    textClass = 'text-amber-800 font-bold';
  }

  return (
    <div className="flex flex-col gap-1 text-xs">
      <div className="flex items-center justify-between font-medium">
        <span className="text-slate-700">
          {load} / {cap} kg
        </span>
        <div className="flex items-center gap-1">
          {isCritical && (
            <span className="flex items-center gap-0.5 text-[9px] font-extrabold text-red-700 bg-red-100 px-1 py-0.2 rounded">
              <AlertTriangle className="w-3 h-3 text-red-600" />
              <span>HIGH LOAD</span>
            </span>
          )}
          <span className={`text-[11px] ${textClass}`}>{percent}%</span>
        </div>
      </div>

      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default LoadProgress;
