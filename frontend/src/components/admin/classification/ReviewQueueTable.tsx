import React from 'react';
import type { ClassificationEvent } from '../../../types/classification';
import { Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface ReviewQueueTableProps {
  queue: ClassificationEvent[];
  onReview: (event: ClassificationEvent) => void;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
}

export const ReviewQueueTable: React.FC<ReviewQueueTableProps> = ({
  queue,
  onReview,
  onConfirm,
  onReject,
}) => {
  const pendingCount = queue.filter((q) => q.reviewStatus === 'PENDING').length;
  const lowConfCount = queue.filter((q) => q.confidence < 70).length;
  const mixedCount = queue.filter((q) => q.status === 'MIXED').length;

  return (
    <div className="space-y-4">
      {/* KPI Cards Strip for Review Queue */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">Pending Review</span>
            <span className="text-xl font-extrabold text-amber-950 font-mono">{pendingCount}</span>
          </div>
          <Clock className="w-5 h-5 text-amber-600" />
        </div>

        <div className="bg-red-50/80 border border-red-200 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-red-800 uppercase tracking-wider block">Low Confidence</span>
            <span className="text-xl font-extrabold text-red-950 font-mono">{lowConfCount}</span>
          </div>
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>

        <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-purple-800 uppercase tracking-wider block">Mixed Waste</span>
            <span className="text-xl font-extrabold text-purple-950 font-mono">{mixedCount}</span>
          </div>
          <Clock className="w-5 h-5 text-purple-600" />
        </div>

        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Corrected Today</span>
            <span className="text-xl font-extrabold text-emerald-950 font-mono">12</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
      </div>

      {/* Review Queue Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Uncertain Detections Requiring Human Audit</h3>
          </div>
          <span className="text-xs font-mono text-slate-500">{queue.length} items in queue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">ID</th>
                <th className="pb-3">Bin</th>
                <th className="pb-3">Zone</th>
                <th className="pb-3">Detected Category</th>
                <th className="pb-3 text-right">Confidence</th>
                <th className="pb-3 text-right">Est. Weight</th>
                <th className="pb-3">Review Reason</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium font-mono">
              {queue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-bold text-slate-900">{item.id}</td>
                  <td className="py-3 font-bold text-slate-800">{item.binId}</td>
                  <td className="py-3 font-sans text-slate-700">{item.zone}</td>
                  <td className="py-3 font-sans">
                    <span className="inline-block font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800 border border-slate-200">
                      {item.detectedCategory}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-red-600">
                    {item.confidence}%
                  </td>
                  <td className="py-3 text-right font-bold text-slate-800">
                    {item.estimatedWeightKg} kg
                  </td>
                  <td className="py-3 font-sans text-slate-600 text-[11px] max-w-[200px] truncate">
                    {item.reason || 'Low confidence threshold'}
                  </td>
                  <td className="py-3 text-center font-sans">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        item.reviewStatus === 'CORRECTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.reviewStatus === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : item.reviewStatus === 'CONFIRMED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.reviewStatus || 'PENDING'}
                    </span>
                  </td>
                  <td className="py-3 text-right font-sans">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onReview(item)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded transition-colors shadow-xs"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => onConfirm(item.id)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        title="Confirm AI classification"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onReject(item.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="Reject classification"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
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
