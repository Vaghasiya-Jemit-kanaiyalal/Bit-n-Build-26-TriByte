import React from 'react';
import { Recycle, Leaf, ArrowUpRight, Info } from 'lucide-react';

interface RecyclingAnalyticsCardProps {
  onNavigateToClassification?: () => void;
}

export const RecyclingAnalyticsCard: React.FC<RecyclingAnalyticsCardProps> = ({
  onNavigateToClassification,
}) => {
  const materials = [
    { name: 'Plastic Recovered', tons: 42.3, percent: 32, color: 'bg-blue-500' },
    { name: 'Paper & Cardboard', tons: 31.8, percent: 24, color: 'bg-amber-500' },
    { name: 'Organic Processing', tons: 25.0, percent: 19, color: 'bg-emerald-600' },
    { name: 'Metal & Aluminum', tons: 18.4, percent: 14, color: 'bg-slate-500' },
    { name: 'Glass Containers', tons: 14.6, percent: 11, color: 'bg-purple-500' },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-2xs p-5 mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900 m-0">Recycling Recovery & Environmental Impact</h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              CIRCULAR ECONOMY
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Recyclable material diversion, processing rates and estimated carbon offset
          </p>
        </div>

        {onNavigateToClassification && (
          <button
            onClick={onNavigateToClassification}
            className="flex items-center space-x-1 text-xs font-bold text-[#047857] hover:underline cursor-pointer bg-transparent border-none"
          >
            <span>View Classification</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Top 3 Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-lg">
            <Recycle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-800 font-bold block uppercase">Landfill Diversion</span>
            <strong className="text-lg font-black font-mono text-emerald-950">132.1 Tons</strong>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-3">
          <div className="p-2.5 bg-teal-600 text-white rounded-lg">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Recovery Rate</span>
            <strong className="text-lg font-black font-mono text-slate-900">53.2%</strong>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-3">
          <div className="p-2.5 bg-slate-700 text-white rounded-lg">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Estimated CO₂ Avoided</span>
            <strong className="text-lg font-black font-mono text-slate-900">184.2 tCO₂e</strong>
          </div>
        </div>
      </div>

      {/* Material Recovery Breakdown */}
      <div className="space-y-3 mb-4">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
          Material Recovery Breakdown
        </span>

        {materials.map((mat) => (
          <div key={mat.name} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1 font-semibold">
              <span className="text-slate-800">{mat.name}</span>
              <div className="flex items-center space-x-3 font-mono">
                <span className="text-slate-500">{mat.tons} t</span>
                <strong className="text-slate-900">{mat.percent}%</strong>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${mat.color}`} style={{ width: `${mat.percent}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Conversion Disclaimer */}
      <div className="p-2.5 bg-slate-100 rounded-lg text-[11px] text-slate-500 flex items-center space-x-2">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          Environmental impact values are estimated using configured waste-management conversion factors based on EPA WARM models.
        </span>
      </div>

    </div>
  );
};

export default RecyclingAnalyticsCard;
