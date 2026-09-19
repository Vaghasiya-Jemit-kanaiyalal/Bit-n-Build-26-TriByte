import React from 'react';
import { Eye, CalendarCheck, UserPlus } from 'lucide-react';
import type { PriorityCollectionItem } from '../../../types/dashboard';

interface PriorityCollectionTableProps {
  items: PriorityCollectionItem[];
  onSelectBin: (binId: string) => void;
  onAssignVehicle: (item: PriorityCollectionItem) => void;
  onPrioritize: (item: PriorityCollectionItem) => void;
}

export const PriorityCollectionTable: React.FC<PriorityCollectionTableProps> = ({
  items,
  onSelectBin,
  onAssignVehicle,
  onPrioritize,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-amber-50/40">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-amber-700" />
          <h3 className="text-sm font-bold text-slate-900 m-0">Priority Collection Queue (Immediate Action Required)</h3>
        </div>
        <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-md">
          {items.filter(i => i.priority === 'CRITICAL').length} Critical Bins
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Bin ID</th>
              <th className="py-3 px-4">Location / Zone</th>
              <th className="py-3 px-4">Fill Level</th>
              <th className="py-3 px-4">Overflow ETA</th>
              <th className="py-3 px-4">Est. Waste</th>
              <th className="py-3 px-4">Window</th>
              <th className="py-3 px-4">Assigned Route</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {items.map((item) => {
              let badge = 'bg-amber-100 text-amber-800 font-bold';
              if (item.priority === 'CRITICAL') badge = 'bg-red-100 text-red-800 font-extrabold';

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md ${badge}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.binCode}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{item.location}</span>
                      <span className="text-[10px] text-slate-400">{item.zone} Zone</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-extrabold text-red-600">{item.fillLevel}%</td>
                  <td className="py-3 px-4 font-bold text-red-700">{item.timeToOverflow}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{item.estimatedWasteKg} kg</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{item.collectionWindow}</td>
                  <td className="py-3 px-4 font-bold text-emerald-800">
                    {item.assignedRoute ? `${item.assignedRoute} (${item.assignedVehicle || 'VH-014'})` : 'Unassigned'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectBin(item.binCode)}
                        className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => onAssignVehicle(item)}
                        className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3 text-blue-600" />
                        <span>Assign</span>
                      </button>
                      <button
                        onClick={() => onPrioritize(item)}
                        className="px-2 py-1 bg-[#064e3b] hover:bg-[#047857] text-white rounded-lg text-xs font-bold cursor-pointer border-none shadow-xs"
                      >
                        Prioritize
                      </button>
                    </div>
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
