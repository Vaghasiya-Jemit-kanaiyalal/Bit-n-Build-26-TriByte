import React from 'react';

export const OperationalHealthBar: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs text-slate-700">
      <div className="flex items-center gap-2 font-bold text-slate-900 border-r border-slate-200 pr-4 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="uppercase text-[11px] tracking-wider text-slate-500 font-extrabold">
          NETWORK HEALTH
        </span>
      </div>

      {/* Bin Network */}
      <div className="flex items-center gap-3">
        <span className="font-semibold text-slate-800">Bin Network:</span>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Healthy{' '}
            <strong className="text-slate-900">236</strong>
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-400" /> Offline{' '}
            <strong className="text-slate-700">12</strong>
          </span>
        </div>
      </div>

      {/* Fleet */}
      <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
        <span className="font-semibold text-slate-800">Fleet:</span>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active{' '}
            <strong className="text-slate-900">18</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Idle{' '}
            <strong className="text-slate-900">3</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Maint.{' '}
            <strong className="text-slate-900">2</strong>
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-400" /> Offline{' '}
            <strong className="text-slate-700">1</strong>
          </span>
        </div>
      </div>

      {/* Routes */}
      <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
        <span className="font-semibold text-slate-800">Routes:</span>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> On Time{' '}
            <strong className="text-slate-900">8</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Delayed{' '}
            <strong className="text-slate-900">2</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> At Risk{' '}
            <strong className="text-slate-900">2</strong>
          </span>
        </div>
      </div>

      {/* Sensors */}
      <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
        <span className="font-semibold text-slate-800">Sensors:</span>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Online{' '}
            <strong className="text-slate-900">236</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Warn{' '}
            <strong className="text-slate-900">8</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Offline{' '}
            <strong className="text-slate-900">4</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
