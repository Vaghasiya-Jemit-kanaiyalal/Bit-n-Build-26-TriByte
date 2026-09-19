import React from 'react';
import type { MixedWasteRecord } from '../../../types/classification';
import { Layers, ArrowRight } from 'lucide-react';

interface MixedWasteTableProps {
  mixedRecords: MixedWasteRecord[];
  onReviewMixed: (record: MixedWasteRecord) => void;
}

export const MixedWasteTable: React.FC<MixedWasteTableProps> = ({ mixedRecords, onReviewMixed }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900">Mixed Waste Detections</h3>
        </div>
        <span className="text-xs font-mono text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
          Multiple Material Contamination Signals
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
              <th className="pb-3">Event ID</th>
              <th className="pb-3">Bin ID</th>
              <th className="pb-3">Zone & Location</th>
              <th className="pb-3">Primary Material</th>
              <th className="pb-3">Secondary Material</th>
              <th className="pb-3 text-right">Confidence</th>
              <th className="pb-3 text-right">Est. Weight</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium font-mono">
            {mixedRecords.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 font-bold text-slate-900">{item.id}</td>
                <td className="py-3 font-bold text-slate-800">{item.binId}</td>
                <td className="py-3 font-sans text-slate-700">
                  <span className="font-semibold block">{item.zone}</span>
                  <span className="text-[10px] text-slate-400">{item.location}</span>
                </td>
                <td className="py-3 font-sans">
                  <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded font-bold border border-purple-200 text-[11px]">
                    {item.primaryMaterial}
                  </span>
                </td>
                <td className="py-3 font-sans">
                  <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-bold border border-amber-200 text-[11px]">
                    {item.secondaryMaterial}
                  </span>
                </td>
                <td className="py-3 text-right font-bold text-amber-700">{item.confidence}%</td>
                <td className="py-3 text-right font-bold text-slate-900">{item.estimatedWeightKg} kg</td>
                <td className="py-3 text-right font-sans">
                  <button
                    onClick={() => onReviewMixed(item)}
                    className="px-2.5 py-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md transition-colors flex items-center gap-1 ml-auto"
                  >
                    <span>Review Mixed</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
