import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import type { TimeOfDayPoint } from '../../mock/analyticsMockData';

interface TimeOfDayAnalyticsProps {
  timeData: TimeOfDayPoint[];
}

export const TimeOfDayAnalytics: React.FC<TimeOfDayAnalyticsProps> = ({ timeData }) => {
  const maxCollections = Math.max(...timeData.map(t => t.collections));

  const weekdays = [
    { day: 'Mon', volume: 8.0, peak: false },
    { day: 'Tue', volume: 7.6, peak: false },
    { day: 'Wed', volume: 8.2, peak: false },
    { day: 'Thu', volume: 8.4, peak: false },
    { day: 'Fri', volume: 8.9, peak: false },
    { day: 'Sat', volume: 10.4, peak: true },
    { day: 'Sun', volume: 9.5, peak: false },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
      {/* Left: Time of Day Activity */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-2xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#047857]" />
              <h3 className="text-sm font-bold text-slate-900 m-0">Collection Activity by Time</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Hourly collection density across municipal operational shifts
            </p>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            PEAK: 08:00–11:00
          </span>
        </div>

        {/* Hourly vertical bar chart */}
        <div className="grid grid-cols-8 gap-2 items-end h-32 bg-slate-50 p-3 rounded-lg border border-slate-200">
          {timeData.map((pt) => {
            const heightPercent = Math.round((pt.collections / maxCollections) * 100);
            const isPeak = pt.hour === '08:00' || pt.hour === '10:00';

            return (
              <div key={pt.hour} className="flex flex-col items-center justify-end h-full">
                <div
                  className={`w-full max-w-[20px] rounded-t-xs transition-all ${
                    isPeak ? 'bg-[#047857]' : 'bg-slate-400'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                  title={`${pt.hour}: ${pt.collections} collections (${pt.avgVolumeTons}t)`}
                />
                <span className="text-[9px] font-mono text-slate-500 mt-1.5">{pt.hour}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Waste Generation by Weekday */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-2xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#047857]" />
              <h3 className="text-sm font-bold text-slate-900 m-0">Waste Generation by Day of Week</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Weekly generation distribution pattern
            </p>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            SATURDAY PEAK (10.4t)
          </span>
        </div>

        {/* Weekday bars */}
        <div className="grid grid-cols-7 gap-2 items-end h-32 bg-slate-50 p-3 rounded-lg border border-slate-200">
          {weekdays.map((w) => {
            const heightPercent = Math.round((w.volume / 11) * 100);
            return (
              <div key={w.day} className="flex flex-col items-center justify-end h-full">
                <div
                  className={`w-full max-w-[24px] rounded-t-xs transition-all ${
                    w.peak ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                  title={`${w.day}: ${w.volume}t`}
                />
                <span className="text-[9px] font-mono text-slate-500 mt-1.5">{w.day}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default TimeOfDayAnalytics;
