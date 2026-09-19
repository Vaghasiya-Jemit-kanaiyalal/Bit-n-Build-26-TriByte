import React from 'react';
import type { WasteCategoryItem } from '../../../types/classification';
import { CheckCircle2, XCircle, ChevronRight, Layers } from 'lucide-react';

interface CategoryPerformanceTableProps {
  categories: WasteCategoryItem[];
  onSelectCategory: (category: WasteCategoryItem) => void;
}

export const CategoryPerformanceTable: React.FC<CategoryPerformanceTableProps> = ({
  categories,
  onSelectCategory,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-600" />
          <h3 className="text-sm font-bold text-slate-900">Category Performance Overview</h3>
        </div>
        <span className="text-xs font-mono text-slate-400">Click row for Category Details Drawer</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
              <th className="pb-3">Category</th>
              <th className="pb-3 text-right">Classified Weight</th>
              <th className="pb-3 text-right">Percentage</th>
              <th className="pb-3 text-right">Total Items</th>
              <th className="pb-3 text-right">Avg Confidence</th>
              <th className="pb-3 text-center">Recyclable</th>
              <th className="pb-3 text-right">Trend</th>
              <th className="pb-3 text-center">Status</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {categories.map((cat) => (
              <tr
                key={cat.category}
                onClick={() => onSelectCategory(cat)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">{cat.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Top Zone: {cat.topZone}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-right font-mono font-bold text-slate-900">
                  {cat.weightTons} t
                </td>
                <td className="py-3 text-right font-mono font-bold text-slate-800">
                  {cat.percentage}%
                </td>
                <td className="py-3 text-right font-mono text-slate-600">
                  {cat.itemsCount.toLocaleString()}
                </td>
                <td className="py-3 text-right font-mono font-bold text-emerald-700">
                  {cat.avgConfidence}%
                </td>
                <td className="py-3 text-center">
                  {cat.isRecyclable ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      <XCircle className="w-3 h-3 text-slate-400" /> No
                    </span>
                  )}
                </td>
                <td className="py-3 text-right font-mono font-bold text-emerald-600">
                  {cat.trend}
                </td>
                <td className="py-3 text-center">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                      cat.status === 'Healthy'
                        ? 'bg-emerald-100 text-emerald-800'
                        : cat.status === 'Surge'
                        ? 'bg-blue-100 text-blue-800'
                        : cat.status === 'Attention'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {cat.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button className="text-slate-400 hover:text-slate-900 p-1 rounded hover:bg-slate-100 transition-colors">
                    <ChevronRight className="w-4 h-4" />
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
