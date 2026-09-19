import React from 'react';
import {
  LayoutDashboard,
  Radio,
  Clock,
  PieChart,
  MapPin,
  History,
} from 'lucide-react';

export type ClassificationTabType =
  | 'Overview'
  | 'Live Classification'
  | 'Review Queue'
  | 'Waste Composition'
  | 'Zone Analysis'
  | 'Classification History';

interface ClassificationTabsProps {
  activeTab: ClassificationTabType;
  onTabChange: (tab: ClassificationTabType) => void;
  pendingReviewCount: number;
}

export const ClassificationTabs: React.FC<ClassificationTabsProps> = ({
  activeTab,
  onTabChange,
  pendingReviewCount,
}) => {
  const tabs: { name: ClassificationTabType; icon: React.ElementType; badge?: number }[] = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Live Classification', icon: Radio },
    { name: 'Review Queue', icon: Clock, badge: pendingReviewCount },
    { name: 'Waste Composition', icon: PieChart },
    { name: 'Zone Analysis', icon: MapPin },
    { name: 'Classification History', icon: History },
  ];

  return (
    <div className="bg-white border-b border-slate-200 px-4 pt-2 shadow-xs">
      <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => onTabChange(tab.name)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[#047857] text-[#064e3b] bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#047857]' : 'text-slate-400'}`} />
              <span>{tab.name}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-amber-100 text-amber-800 font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-amber-200">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
