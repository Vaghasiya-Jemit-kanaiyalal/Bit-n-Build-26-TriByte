import React from 'react';

interface AlertStatusSummaryProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  counts: {
    all: number;
    active: number;
    acknowledged: number;
    resolved: number;
    snoozed: number;
    unread: number;
  };
}

export const AlertStatusSummary: React.FC<AlertStatusSummaryProps> = ({
  currentStatus,
  onStatusChange,
  counts,
}) => {
  const tabs = [
    { key: 'ALL', label: 'ALL', count: counts.all },
    { key: 'ACTIVE', label: 'ACTIVE', count: counts.active },
    { key: 'ACKNOWLEDGED', label: 'ACKNOWLEDGED', count: counts.acknowledged },
    { key: 'RESOLVED', label: 'RESOLVED', count: counts.resolved },
    { key: 'SNOOZED', label: 'SNOOZED', count: counts.snoozed },
    { key: 'UNREAD', label: 'UNREAD', count: counts.unread },
  ];

  return (
    <div className="bg-white rounded-md border border-[#e5e7eb] p-2 shadow-2xs mb-6 flex flex-wrap items-center gap-1.5">
      {tabs.map((tab) => {
        const isActive = currentStatus === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onStatusChange(tab.key)}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 border ${
              isActive
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                isActive
                  ? 'bg-slate-800 text-[#88a573]'
                  : 'bg-slate-200/80 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default AlertStatusSummary;
