import React from 'react';
import { AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { PlanningIssue } from '../../../types/planning';

interface PlanningIssuesSectionProps {
  issues: PlanningIssue[];
  onResolveIssue: (issueId: string) => void;
}

export const PlanningIssuesSection: React.FC<PlanningIssuesSectionProps> = ({
  issues,
  onResolveIssue,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
            Planning Issues & Conflict Validation
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Detect capacity overflows, driver shift double-bookings, unassigned critical bins, and time window risks.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold px-3 py-1 bg-slate-800 text-amber-400 border border-slate-700 rounded-full">
          {issues.filter((i) => !i.isResolved).length} Issues Open
        </span>
      </div>

      {/* Issues List */}
      <div className="divide-y divide-slate-200">
        {issues.map((issue) => {
          const id = issue.issueId || issue.id || 'issue';

          return (
            <div
              key={id}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                issue.isResolved ? 'bg-slate-50 opacity-60' : 'bg-white'
              }`}
            >
              <div className="flex items-start space-x-3">
                {issue.severity === 'CONFLICT' ? (
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                ) : issue.severity === 'WARNING' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                )}

                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded ${
                      issue.severity === 'CONFLICT' ? 'bg-red-100 text-red-700 border border-red-200' :
                      issue.severity === 'WARNING' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {issue.severity}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700">{issue.affectedEntity}</span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium">{issue.message}</p>
                </div>
              </div>

              {/* Action */}
              <div>
                {issue.isResolved ? (
                  <span className="flex items-center text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Resolved
                  </span>
                ) : (
                  <button
                    onClick={() => onResolveIssue(id)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                  >
                    {issue.actionText}
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
