import React from 'react';
import { CalendarCheck, Plus } from 'lucide-react';
import type { PredictionPriorityItem } from '../../../types/prediction';

interface PredictionPriorityQueueProps {
  queue: PredictionPriorityItem[];
  onAddToPlan: (item: PredictionPriorityItem) => void;
}

export const PredictionPriorityQueue: React.FC<PredictionPriorityQueueProps> = ({
  queue,
  onAddToPlan,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-[#047857]" />
          <h3 className="text-sm font-bold text-slate-900 m-0">Operational Priority Recommendation Queue</h3>
        </div>
        <span className="text-xs text-slate-500 font-semibold">{queue.length} Bins Queued</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Score</th>
              <th className="py-3 px-4">Bin ID</th>
              <th className="py-3 px-4">Zone / Location</th>
              <th className="py-3 px-4">Overflow ETA</th>
              <th className="py-3 px-4">Est. Waste</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Recommendation</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {queue.map((item) => {
              let statusBadge = 'bg-slate-100 text-slate-700';
              if (item.status === 'NEW') statusBadge = 'bg-blue-100 text-blue-800 font-bold';
              else if (item.status === 'PLANNED') statusBadge = 'bg-emerald-100 text-emerald-800 font-bold';

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-extrabold text-[#047857]">{item.priorityScore}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.binCode}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{item.location}</span>
                      <span className="text-[10px] text-slate-400">{item.zone} Zone</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-red-600">{item.timeRemaining} ({item.predictedOverflowTime})</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{item.estimatedWasteKg} kg</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-600">{item.confidence}%</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{item.recommendation}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md ${statusBadge}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onAddToPlan(item)}
                      className="px-2.5 py-1 bg-[#064e3b] hover:bg-[#047857] text-white rounded-lg text-xs font-bold cursor-pointer border-none flex items-center gap-1 shadow-xs ml-auto"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add to Plan</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
