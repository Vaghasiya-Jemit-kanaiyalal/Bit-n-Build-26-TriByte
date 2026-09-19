import React from 'react';
import { Scale } from 'lucide-react';
import type { DriverRoute } from '../../../types/driver';

interface CollectionSummaryProps {
  wasteByCategory: DriverRoute['wasteByCategory'];
}

export const CollectionSummary: React.FC<CollectionSummaryProps> = ({ wasteByCategory }) => {
  const categories = [
    { name: 'Plastic', value: wasteByCategory.Plastic || 1.2, color: 'bg-emerald-500', barColor: '#10b981' },
    { name: 'Organic', value: wasteByCategory.Organic || 1.0, color: 'bg-emerald-800', barColor: '#047857' },
    { name: 'Paper', value: wasteByCategory.Paper || 0.6, color: 'bg-blue-500', barColor: '#3b82f6' },
    { name: 'Metal', value: wasteByCategory.Metal || 0.4, color: 'bg-purple-500', barColor: '#8b5cf6' },
    { name: 'Glass', value: wasteByCategory.Glass || 0.3, color: 'bg-amber-500', barColor: '#f59e0b' },
    { name: 'Other', value: wasteByCategory.Other || 0.3, color: 'bg-slate-500', barColor: '#64748b' },
  ];

  const totalTonnage = Number(categories.reduce((acc, curr) => acc + curr.value, 0).toFixed(2));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-700" />
            <h3 className="text-base font-extrabold text-slate-900">Waste Breakdown by Category</h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            {totalTonnage} t Total
          </span>
        </div>

        {/* Stacked Tonnage Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex mb-4">
          {categories.map((cat) => {
            const pct = totalTonnage > 0 ? (cat.value / totalTonnage) * 100 : 0;
            return (
              <div
                key={cat.name}
                style={{ width: `${pct}%`, backgroundColor: cat.barColor }}
                title={`${cat.name}: ${cat.value} t (${Math.round(pct)}%)`}
                className="h-full transition-all duration-300 hover:opacity-90"
              />
            );
          })}
        </div>

        {/* Category Legend List */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {categories.map((item) => {
            const pct = totalTonnage > 0 ? Math.round((item.value / totalTonnage) * 100) : 0;
            return (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.color}`} />
                  <span className="font-semibold text-slate-700 truncate">{item.name}</span>
                </div>
                <div className="text-right ml-1 shrink-0">
                  <span className="font-mono font-bold text-slate-900 block">{item.value} t</span>
                  <span className="text-[10px] text-slate-400 block">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CollectionSummary;
