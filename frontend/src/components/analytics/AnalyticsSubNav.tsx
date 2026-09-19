import React from 'react';
import {
  LayoutGrid,
  Trash2,
  CheckCircle2,
  Route,
  Truck,
  MapPin,
  Recycle,
  BrainCircuit
} from 'lucide-react';

export type AnalyticsTabType =
  | 'Overview'
  | 'Waste'
  | 'Collections'
  | 'Routes'
  | 'Fleet'
  | 'Zones'
  | 'Recycling'
  | 'Predictions';

interface AnalyticsSubNavProps {
  activeTab: AnalyticsTabType;
  onTabChange: (tab: AnalyticsTabType) => void;
}

export const AnalyticsSubNav: React.FC<AnalyticsSubNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: Array<{ id: AnalyticsTabType; label: string; icon: React.ElementType }> = [
    { id: 'Overview', label: 'Overview', icon: LayoutGrid },
    { id: 'Waste', label: 'Waste Generation', icon: Trash2 },
    { id: 'Collections', label: 'Collections', icon: CheckCircle2 },
    { id: 'Routes', label: 'Routes', icon: Route },
    { id: 'Fleet', label: 'Fleet & Vehicles', icon: Truck },
    { id: 'Zones', label: 'Zones', icon: MapPin },
    { id: 'Recycling', label: 'Recycling & Impact', icon: Recycle },
    { id: 'Predictions', label: 'AI Predictions', icon: BrainCircuit },
  ];

  return (
    <div className="bg-white border-b border-[#e5e7eb] px-6 mb-6 overflow-x-auto scrollbar-none">
      <div className="flex items-center space-x-1 min-w-max">
        {tabs.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 py-3 px-3.5 border-b-2 text-xs font-bold transition-all cursor-pointer bg-transparent border-none ${
                isActive
                  ? 'border-[#047857] text-[#047857]'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <IconComp className={`w-4 h-4 ${isActive ? 'text-[#047857]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsSubNav;
