import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { LowConfidencePrediction } from '../../../types/prediction';

interface LowConfidenceTableProps {
  predictions: LowConfidencePrediction[];
  onReview: (pred: LowConfidencePrediction) => void;
}

export const LowConfidenceTable: React.FC<LowConfidenceTableProps> = ({ predictions, onReview }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-amber-50/50">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900 m-0">Low Confidence Predictions Requiring Operator Review</h3>
        </div>
        <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
          {predictions.filter(p => p.status === 'PENDING').length} Pending
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Prediction ID</th>
              <th className="py-3 px-4">Bin ID / Zone</th>
              <th className="py-3 px-4">Current / Pred</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {predictions.map((p) => {
              let statusBadge = 'bg-amber-100 text-amber-800 font-bold';
              if (p.status === 'ACCEPTED') statusBadge = 'bg-emerald-100 text-emerald-800 font-bold';
              else if (p.status === 'DISMISSED') statusBadge = 'bg-slate-100 text-slate-600';

              return (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.id}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{p.binCode}</span>
                      <span className="text-[10px] text-slate-400">{p.zone} &bull; {p.location}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="font-bold text-slate-900">{p.currentFill}%</span> &rarr; <span className="font-extrabold text-amber-700">{p.predictedFill}%</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-extrabold text-red-600">{p.confidence}%</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{p.reason}</td>
                  <td className="py-3 px-4 text-slate-500">{p.createdAt}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md ${statusBadge}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onReview(p)}
                      className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 cursor-pointer shadow-xs ml-auto"
                    >
                      Review
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
