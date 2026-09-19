import React from 'react';
import { ArrowRight, BrainCircuit } from 'lucide-react';

interface AIAlertInsightsProps {
  onNavigateToPredictions?: () => void;
}

export const AIAlertInsights: React.FC<AIAlertInsightsProps> = ({ onNavigateToPredictions }) => {
  return (
    <div className="bg-emerald-950 text-white rounded-xl p-4 shadow-md border border-emerald-900/80 space-y-3 relative overflow-hidden">
      
      {/* Background Accent SVG Glow */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-emerald-900 rounded text-[#88a573] border border-emerald-800">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider m-0">AI Alert Insights</h3>
        </div>
        <span className="text-[9px] font-mono uppercase bg-emerald-900/80 text-[#88a573] px-2 py-0.5 rounded border border-emerald-800">
          AI INSIGHT
        </span>
      </div>

      <div className="space-y-2 text-xs text-slate-300">
        <div className="p-2.5 bg-slate-900/60 rounded-lg border border-emerald-900/50 leading-tight">
          &bull; <strong className="text-white">Predicted overflow alerts</strong> increased <span className="text-emerald-400 font-bold">18%</span> compared with the previous 7-day period.
        </div>
        <div className="p-2.5 bg-slate-900/60 rounded-lg border border-emerald-900/50 leading-tight">
          &bull; <strong className="text-white">Industrial Zone</strong> generated the highest number of waste-generation surge alerts.
        </div>
        <div className="p-2.5 bg-slate-900/60 rounded-lg border border-emerald-900/50 leading-tight">
          &bull; <strong className="text-white">14 smart bins</strong> are currently predicted to require collection within the next 6 hours.
        </div>
      </div>

      <button
        onClick={onNavigateToPredictions}
        className="w-full py-2 bg-[#738a62] hover:bg-[#5f7350] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
      >
        <span>View Prediction Analytics</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default AIAlertInsights;
