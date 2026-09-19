import React from 'react';
import { BrainCircuit, Sparkles } from 'lucide-react';
import type { AISettingsData } from '../../../types/settings';

interface AiPredictionsSectionProps {
  data: AISettingsData;
  onChange: (data: AISettingsData) => void;
}

export const AiPredictionsSection: React.FC<AiPredictionsSectionProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof AISettingsData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 m-0">AI & Predictions Configuration</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure AI-assisted waste forecasting, fill-level prediction, collection prioritization, and operational recommendations.
        </p>
      </div>

      {/* AI Engine Status Summary Card */}
      <div className="p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#047857] text-white rounded-lg">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900">AI ML Prediction Engine</span>
              <span className="text-[10px] font-bold text-[#047857] bg-emerald-100 px-2 py-0.2 rounded border border-emerald-300">
                {data.aiEngineStatus}
              </span>
            </div>
            <span className="text-[11px] text-slate-600 font-mono">Last Model Training: {data.lastModelUpdate}</span>
          </div>
        </div>
        <div className="text-right text-xs font-mono">
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Model Confidence</span>
          <strong className="text-slate-900 font-black text-sm">{data.predictionConfidencePercent}%</strong>
        </div>
      </div>

      {/* Forecast & Scoring Toggles */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>AI Feature Engine Toggles</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Fill-Level Prediction Engine</span>
              <span className="text-[10px] text-slate-500">Forecast bin capacity fill trajectories</span>
            </div>
            <input
              type="checkbox"
              checked={data.enableFillLevelPrediction}
              onChange={(e) => handleChange('enableFillLevelPrediction', e.target.checked)}
              className="w-4 h-4 rounded text-[#047857] focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Waste Generation Forecasting</span>
              <span className="text-[10px] text-slate-500">Predict volume spikes by zone</span>
            </div>
            <input
              type="checkbox"
              checked={data.enableWasteGenerationForecasting}
              onChange={(e) => handleChange('enableWasteGenerationForecasting', e.target.checked)}
              className="w-4 h-4 rounded text-[#047857] focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Collection Priority Scoring</span>
              <span className="text-[10px] text-slate-500">Rank high-risk overflow bins</span>
            </div>
            <input
              type="checkbox"
              checked={data.enableCollectionPriorityScoring}
              onChange={(e) => handleChange('enableCollectionPriorityScoring', e.target.checked)}
              className="w-4 h-4 rounded text-[#047857] focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-900 block">AI Anomaly Detection</span>
              <span className="text-[10px] text-slate-500">Detect unusual waste spikes</span>
            </div>
            <input
              type="checkbox"
              checked={data.enableAiAnomalyDetection}
              onChange={(e) => handleChange('enableAiAnomalyDetection', e.target.checked)}
              className="w-4 h-4 rounded text-[#047857] focus:ring-0"
            />
          </label>

        </div>
      </div>

      {/* Prediction Parameters & Mode */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Prediction Horizon (Hours)</label>
            <select
              value={data.predictionHorizonHours}
              onChange={(e) => handleChange('predictionHorizonHours', Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#047857]"
            >
              <option value={6}>6 Hours</option>
              <option value={12}>12 Hours</option>
              <option value={24}>24 Hours (Recommended)</option>
              <option value={48}>48 Hours</option>
              <option value={168}>7 Days</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">AI Recommendation Mode</label>
            <select
              value={data.aiRecommendationMode}
              onChange={(e) => handleChange('aiRecommendationMode', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-bold text-slate-900 focus:outline-none focus:border-[#047857]"
            >
              <option value="Advisory">Advisory (Human Admin Approves All Actions)</option>
              <option value="Semi-Automatic">Semi-Automatic (Auto-Assign Priority Only)</option>
              <option value="Automatic">Automatic (Fully Automated Route Dispatch)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Require Admin Approval Before Auto Route Changes</span>
            <span className="text-[10px] text-slate-500">Require explicit confirmation before modifying live collection loops</span>
          </div>
          <input
            type="checkbox"
            checked={data.requireAdminApprovalBeforeAutoRouteChanges}
            onChange={(e) => handleChange('requireAdminApprovalBeforeAutoRouteChanges', e.target.checked)}
            className="w-4 h-4 rounded text-[#047857] focus:ring-0 cursor-pointer"
          />
        </div>

      </div>

    </div>
  );
};

export default AiPredictionsSection;
