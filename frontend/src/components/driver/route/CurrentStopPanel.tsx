import React, { useState, useEffect } from 'react';
import { MapPin, PackageCheck, Play, AlertTriangle, FastForward, Timer } from 'lucide-react';
import type { DriverRouteStop } from '../../../types/driver';

interface CurrentStopPanelProps {
  stop: DriverRouteStop | null;
  onNavigateStop?: (stop: DriverRouteStop) => void;
  onStartCollection: (stopId: string) => void;
  onMarkCollected: (stop: DriverRouteStop) => void;
  onReportIssue: (stop: DriverRouteStop) => void;
  onSkipStop: (stop: DriverRouteStop) => void;
}

export const CurrentStopPanel: React.FC<CurrentStopPanelProps> = ({
  stop,
  onStartCollection,
  onMarkCollected,
  onReportIssue,
  onSkipStop,
}) => {
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  useEffect(() => {
    let interval: any = null;
    if (stop?.status === 'COLLECTING') {
      interval = setInterval(() => {
        setTimerSeconds((prev: number) => prev + 1);
      }, 1000);
    } else {
      setTimerSeconds(0);
    }
    return () => clearInterval(interval);
  }, [stop?.status]);

  if (!stop) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center text-slate-400 text-xs shadow-xs">
        No stop selected.
      </div>
    );
  }

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isCollecting = stop.status === 'COLLECTING';
  const isCompleted = stop.status === 'COMPLETED';
  const isSkipped = stop.status === 'SKIPPED';
  const isCritical = stop.priority === 'CRITICAL' || stop.fillLevel >= 90;

  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full ${
      isCollecting ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
    }`}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              {isCollecting ? 'COLLECTION IN PROGRESS' : 'CURRENT TARGET STOP'}
            </span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border ${
            isCritical ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            {stop.priority} PRIORITY
          </span>
        </div>

        {/* Bin & Location */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xl font-extrabold text-slate-900 font-mono">{stop.binId}</span>
            <span className="text-2xl font-extrabold font-mono text-emerald-800">{stop.fillLevel}%</span>
          </div>
          <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{stop.location}</span>
          </p>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-2.5 bg-slate-50 border border-slate-200/80 p-3 rounded-xl mb-4 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Waste Category</span>
            <span className="font-bold text-slate-900 truncate block mt-0.5">{stop.wasteType}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Est. Weight</span>
            <span className="font-bold text-slate-900 font-mono block mt-0.5">{stop.estimatedWasteKg} kg</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Distance</span>
            <span className="font-bold text-slate-900 font-mono block mt-0.5">{stop.distanceKm} km</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Est. Arrival</span>
            <span className="font-bold text-slate-900 font-mono block mt-0.5">{stop.estimatedArrivalMin} min</span>
          </div>
        </div>

        {/* Live Collection Stopwatch Timer if Collecting */}
        {isCollecting && (
          <div className="bg-emerald-900 text-white p-3 rounded-xl mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-emerald-300 animate-spin" />
              <span className="text-xs font-bold">Collection Timer:</span>
            </div>
            <span className="font-mono text-lg font-extrabold text-emerald-300">{formatTimer(timerSeconds)}</span>
          </div>
        )}
      </div>

      {/* Action Buttons Flow */}
      <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
        {!isCompleted && !isSkipped && (
          <div className="flex gap-2">
            {!isCollecting ? (
              <button
                onClick={() => onStartCollection(stop.id)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border-none transition-all shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                <span>Start Collection</span>
              </button>
            ) : null}

            <button
              onClick={() => onMarkCollected(stop)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border-none transition-all shadow-xs"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Mark Collected</span>
            </button>
          </div>
        )}

        {!isCompleted && (
          <div className="flex gap-2">
            <button
              onClick={() => onSkipStop(stop)}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer border border-amber-200 transition-all"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Skip Stop</span>
            </button>

            <button
              onClick={() => onReportIssue(stop)}
              className="flex-1 py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer border border-red-200 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentStopPanel;
