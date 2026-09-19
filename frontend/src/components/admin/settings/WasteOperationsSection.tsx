import React from 'react';
import type { WasteOperationsSettings } from '../../../types/settings';

interface WasteOperationsSectionProps {
  data: WasteOperationsSettings;
  onChange: (data: WasteOperationsSettings) => void;
}

export const WasteOperationsSection: React.FC<WasteOperationsSectionProps> = ({ data, onChange }) => {
  const handleToggleCategory = (catId: string) => {
    const updated = data.categories.map(c => c.id === catId ? { ...c, enabled: !c.enabled } : c);
    onChange({ ...data, categories: updated });
  };

  const handleFieldChange = (field: keyof WasteOperationsSettings, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 m-0">Waste Operations</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure collection rules, waste categories, fill-level thresholds, and processing rules.
        </p>
      </div>

      {/* Waste Categories Grid */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
          Recognized Waste Categories & Processing Rules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.categories.map((cat) => (
            <div
              key={cat.id}
              className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                cat.enabled ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-100/50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <input
                  type="checkbox"
                  checked={cat.enabled}
                  onChange={() => handleToggleCategory(cat.id)}
                  className="rounded text-[#047857] focus:ring-0 cursor-pointer"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                    {cat.isRecyclable ? (
                      <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Recyclable
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        Non-Recyclable
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{cat.handlingType}</span>
                </div>
              </div>

              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                cat.enabled ? 'bg-emerald-100 text-[#047857]' : 'bg-slate-200 text-slate-600'
              }`}>
                {cat.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Threshold & Rule Configuration */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
          Collection Fill-Level Threshold Rules
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Minimum Collection Threshold (%)
            </label>
            <input
              type="number"
              min={50}
              max={85}
              value={data.minCollectionFillThreshold}
              onChange={(e) => handleFieldChange('minCollectionFillThreshold', Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#047857]"
            />
            <span className="text-[10px] text-slate-400 font-medium block mt-1">Bins below this level are skipped in regular dispatch loops.</span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Critical Fill Threshold (%)
            </label>
            <input
              type="number"
              min={80}
              max={94}
              value={data.criticalFillThreshold}
              onChange={(e) => handleFieldChange('criticalFillThreshold', Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-amber-800 focus:outline-none focus:border-[#047857]"
            />
            <span className="text-[10px] text-slate-400 font-medium block mt-1">Triggers high-priority collection assignment.</span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Overflow Threshold (%)
            </label>
            <input
              type="number"
              min={90}
              max={100}
              value={data.overflowThreshold}
              onChange={(e) => handleFieldChange('overflowThreshold', Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-red-700 focus:outline-none focus:border-[#047857]"
            />
            <span className="text-[10px] text-slate-400 font-medium block mt-1">Generates immediate critical overflow alert.</span>
          </div>

        </div>

        {/* Priority Strategy Controls */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Default Collection Priority Strategy</label>
            <select
              value={data.defaultCollectionPriority}
              onChange={(e) => handleFieldChange('defaultCollectionPriority', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-bold text-slate-900 focus:outline-none focus:border-[#047857]"
            >
              <option value="AI-based">AI-based Dynamic Priority (Recommended)</option>
              <option value="Fill-based">Strict Fill-Level Highest First</option>
              <option value="Manual">Manual Fleet Dispatch Only</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 mt-5">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Allow Manual Priority Override</span>
              <span className="text-[10px] text-slate-500">Enable operators to re-rank priority bins manually</span>
            </div>
            <input
              type="checkbox"
              checked={data.allowManualPriorityOverride}
              onChange={(e) => handleFieldChange('allowManualPriorityOverride', e.target.checked)}
              className="w-4 h-4 rounded text-[#047857] focus:ring-0 cursor-pointer"
            />
          </div>
        </div>

      </div>

    </div>
  );
};

export default WasteOperationsSection;
