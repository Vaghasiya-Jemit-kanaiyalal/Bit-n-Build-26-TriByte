import React from 'react';
import type { WasteCategoryItem, WasteType } from '../../../types/classification';
import { PieChart, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';

interface WasteCompositionChartProps {
  categories: WasteCategoryItem[];
  selectedCategory?: WasteType | 'ALL';
  onCategoryClick: (category: WasteCategoryItem) => void;
}

export const WasteCompositionChart: React.FC<WasteCompositionChartProps> = ({
  categories,
  selectedCategory,
  onCategoryClick,
}) => {
  const totalWeight = categories.reduce((sum, c) => sum + c.weightTons, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Waste Material Composition</h3>
        </div>
        <span className="text-xs font-mono text-slate-500">
          Total: <strong className="text-slate-900">{totalWeight.toFixed(1)} Tons</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Donut Graphic Representation */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Custom Multi-Color Conic Gradient Donut Ring */}
            <div
              className="w-44 h-44 rounded-full shadow-inner flex items-center justify-center transition-transform hover:scale-105 duration-300"
              style={{
                background: `conic-gradient(
                  #10b981 0% 31.0%,
                  #3b82f6 31.0% 56.0%,
                  #f59e0b 56.0% 73.8%,
                  #64748b 73.8% 84.5%,
                  #8b5cf6 84.5% 92.8%,
                  #ef4444 92.8% 100%
                )`,
              }}
            >
              {/* Inner cutout hole */}
              <div className="w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center shadow-md text-center p-2">
                <span className="text-2xl font-extrabold text-slate-900 font-mono leading-none">
                  8.4t
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  Classified
                </span>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 border border-emerald-100">
                  6 Categories
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium text-center mt-3">
            Click any category slice or table row to inspect detailed metrics
          </p>
        </div>

        {/* Right Category Breakdown Table */}
        <div className="lg:col-span-7 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-2">Category</th>
                <th className="pb-2 text-right">Weight</th>
                <th className="pb-2 text-right">% Share</th>
                <th className="pb-2 text-right">Items</th>
                <th className="pb-2 text-right">Avg Conf.</th>
                <th className="pb-2 text-center">Recyclable</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.category;
                return (
                  <tr
                    key={cat.category}
                    onClick={() => onCategoryClick(cat)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50/60' : ''
                    }`}
                  >
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-bold text-slate-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-800">
                      {cat.weightTons} t
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                      {cat.percentage}%
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-600">
                      {cat.itemsCount.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold text-emerald-700">
                      {cat.avgConfidence}%
                    </td>
                    <td className="py-2.5 text-center">
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
                    <td className="py-2.5 text-right">
                      <button className="text-slate-400 hover:text-emerald-700 p-1 rounded hover:bg-slate-200 transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
