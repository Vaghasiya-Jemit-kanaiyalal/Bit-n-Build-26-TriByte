import React from 'react';
import { Sparkles, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

interface AnalyticsInsightsProps {
  onNavigateTab?: (tabName: string) => void;
}

export const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = () => {
  const insights = [
    {
      id: '1',
      title: 'Central Zone Waste Surge',
      description: 'Central zone generated the highest waste volume (284.5 t) during the selected period due to commercial sector activity.',
      category: 'Volume Trend',
      icon: TrendingUp,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: '2',
      title: 'Optimal Fill Benchmark Met',
      description: 'Average bin fill level at collection remained steady at 82.6%, matching the operational efficiency target range of 80–85%.',
      category: 'Collection Target',
      icon: CheckCircle2,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      id: '3',
      title: 'Industrial Zone Overflow Risk',
      description: 'Industrial zone experienced elevated overflow risk during peak hours (10:00–14:00). Shift adjustments recommended.',
      category: 'Overflow Alert',
      icon: AlertTriangle,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      id: '4',
      title: 'Recycling Diversion Gain',
      description: 'Recycling diversion improved by +5.3% compared to the previous period, offsetting 14.2 tons of equivalent CO₂ emissions.',
      category: 'Sustainability',
      icon: Sparkles,
      color: 'text-teal-700 bg-teal-50 border-teal-200',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Key Operational Insights</h3>
            <p className="text-[11px] text-slate-500 font-medium">Core analytical summary for Waste Manager decision support</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {insights.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-2xs transition-all flex items-start space-x-3"
            >
              <div className={`p-2 rounded-lg border ${item.color} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-extrabold text-slate-900 truncate">{item.title}</h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsInsights;
