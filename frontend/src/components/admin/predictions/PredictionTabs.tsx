import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  Weight,
  Award,
  History,
} from 'lucide-react';

export type PredictionTabType =
  | 'Overview'
  | 'Fill Forecast'
  | 'Overflow Risk'
  | 'Waste Demand'
  | 'Prediction Quality'
  | 'Prediction History';

interface PredictionTabsProps {
  activeTab: PredictionTabType;
  onTabChange: (tab: PredictionTabType) => void;
  riskCount: number;
}

export const PredictionTabs: React.FC<PredictionTabsProps> = ({
  activeTab,
  onTabChange,
  riskCount,
}) => {
  const tabs: { id: PredictionTabType; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'Fill Forecast', label: 'Fill Forecast', icon: TrendingUp },
    { id: 'Overflow Risk', label: 'Overflow Risk', icon: AlertTriangle, badge: riskCount },
    { id: 'Waste Demand', label: 'Waste Demand', icon: Weight },
    { id: 'Prediction Quality', label: 'Prediction Quality', icon: Award },
    { id: 'Prediction History', label: 'Prediction History', icon: History },
  ];

  return (
    <div className="bg-white border-b border-slate-200 px-6 pt-2 flex items-center gap-1 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? 'border-[#047857] text-[#047857] bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-[#047857]' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isActive ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
