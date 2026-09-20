import React, { useState, useEffect } from 'react';
import { Bell, Calendar, RefreshCw, Truck } from 'lucide-react';
import type { UserSession } from '../../types/auth';

interface DriverHeaderProps {
  user: UserSession;
  notificationCount?: number;
  onNavigateTab?: (tab: string) => void;
  onRefresh?: () => void;
  isSyncing?: boolean;
}

export const DriverHeader: React.FC<DriverHeaderProps> = ({
  user,
  notificationCount = 3,
  onNavigateTab,
  onRefresh,
  isSyncing = false,
}) => {
  const [currentDateStr, setCurrentDateStr] = useState<string>(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });
  const [greeting, setGreeting] = useState<string>('Good morning');

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    setCurrentDateStr(now.toLocaleDateString('en-US', options));

    const hour = now.getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const firstName = user.name ? user.name.split(' ')[0] : 'Rahul';

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 shadow-xs">
      {/* Title & Greeting */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {greeting}, {firstName}
          </h1>
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wide border border-emerald-200">
            Collection Driver
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Here's your collection overview for today.
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Date Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{currentDateStr}</span>
        </div>

        {/* Sync / Refresh */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isSyncing}
            title="Refresh Route Data"
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer border border-slate-200 bg-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        )}

        {/* Vehicle Quick Tag */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <Truck className="w-3.5 h-3.5 text-emerald-600" />
          <span>VH-014</span>
        </div>

        {/* Notifications */}
        <button
          onClick={() => onNavigateTab && onNavigateTab('Notifications')}
          className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer border border-slate-200 bg-white transition-all"
          title="Driver Notifications"
        >
          <Bell className="w-5 h-5 text-slate-700" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <button
          onClick={() => onNavigateTab && onNavigateTab('Profile')}
          className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer bg-white transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center">
            {firstName.charAt(0)}
          </div>
          <span className="text-xs font-bold text-slate-800 hidden sm:inline pr-1">
            {firstName}
          </span>
        </button>
      </div>
    </header>
  );
};

export default DriverHeader;
