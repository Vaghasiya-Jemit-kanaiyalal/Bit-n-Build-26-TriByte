import React from 'react';
import { History } from 'lucide-react';
import type { PlanningPlan } from '../../../types/planning';

interface RecentPlansSectionProps {
  plans: PlanningPlan[];
  onDeleteDraft: (planId: string) => void;
}

export const RecentPlansSection: React.FC<RecentPlansSectionProps> = ({
  plans,
  onDeleteDraft,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center">
            <History className="w-5 h-5 mr-2 text-emerald-400" />
            Recent Collection Plans History
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Archived and active operational plan schedules, route allocations, and coverage metrics.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Plan ID</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Window</th>
              <th className="py-3 px-4">Routes</th>
              <th className="py-3 px-4">Bins</th>
              <th className="py-3 px-4">Waste</th>
              <th className="py-3 px-4">Fleet</th>
              <th className="py-3 px-4">Coverage</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {plans.map((p) => {
              const pId = p.planId || p.id;
              const hor = p.horizon || p.planningWindow || 'Next 24 Hours';
              const cov = p.coveragePct ?? p.coveragePercent ?? 0;

              return (
                <tr key={pId} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold font-mono text-emerald-800">{pId}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{p.date}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{hor}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.routesCount}</td>
                  <td className="py-3 px-4 font-mono text-slate-800">{p.binsCount}</td>
                  <td className="py-3 px-4 font-mono text-emerald-700">{p.wasteTons} t</td>
                  <td className="py-3 px-4 font-mono text-slate-800">{p.vehiclesCount}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{cov}%</td>
                  
                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      p.status === 'READY' || p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      p.status === 'IN PROGRESS' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      p.status === 'DRAFT' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                      'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {p.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right space-x-2">
                    <button className="text-slate-500 hover:text-emerald-700 font-semibold text-xs">
                      View
                    </button>
                    {p.status === 'DRAFT' && (
                      <button
                        onClick={() => onDeleteDraft(pId)}
                        className="text-red-500 hover:text-red-700 font-semibold text-xs"
                      >
                        Delete
                      </button>
                    )}
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
