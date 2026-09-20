import React, { useState } from 'react';
import type { UserSession } from '../../types/auth';
import {
  ShieldAlert,
  Eye,
  Activity,
  Trash2,
  Truck,
  CheckCircle,
  LogOut,
  User,
  Settings,
  BarChart3,
  MapPin,
  Lock,
  Sun,
  Moon,
} from 'lucide-react';
import NotificationToast from '../common/NotificationToast';

import { UnifiedGisMap } from '../common/UnifiedGisMap';

const ViewerLiveCampusMap: React.FC<{ isDarkMode: boolean }> = () => {
  return (
    <div className="w-full h-full min-h-[420px]">
      <UnifiedGisMap zoneName="DEPSTAR Campus Telemetry" stepIntervalMs={60000} />
    </div>
  );
};

interface ViewerPortalProps {
  user: UserSession;
  onSignOut: () => void;
}

export const ViewerPortal: React.FC<ViewerPortalProps> = ({ user, onSignOut }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'monitoring' | 'profile' | 'settings'>('overview');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-800'}`}>
      <NotificationToast />

      {/* Top Banner for Viewer Role Notice */}
      <div className={`px-4 py-2.5 flex items-center justify-between text-xs transition-colors ${
        isDarkMode 
          ? 'bg-amber-500/10 border-b border-amber-500/20 text-amber-200' 
          : 'bg-amber-50 border-b border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>READ-ONLY VIEWER ACCESS:</strong> Your account is currently in Viewer mode. An Administrator can promote your account to Analyst, Driver, or Manager.
          </span>
        </div>
        <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
          isDarkMode ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
        }`}>
          Role: VIEWER
        </span>
      </div>

      {/* Navbar */}
      <header className={`px-6 py-3.5 border-b flex items-center justify-between transition-colors ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        {/* Brand Logo Header */}
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col">
            <span className={`text-base font-extrabold leading-tight tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>EcoTrack</span>
            <span className={`text-[10px] font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Viewer Console</span>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className={`flex items-center gap-1 p-1 rounded-xl border text-xs font-bold ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer border-none ${
              activeTab === 'overview'
                ? 'bg-[#047857] text-white shadow-xs'
                : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer border-none ${
              activeTab === 'monitoring'
                ? 'bg-[#047857] text-white shadow-xs'
                : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Campus Monitoring
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer border-none ${
              activeTab === 'profile'
                ? 'bg-[#047857] text-white shadow-xs'
                : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Profile
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer border-none ${
              activeTab === 'settings'
                ? 'bg-[#047857] text-white shadow-xs'
                : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Theme Toggle & User Account Pill */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${
              isDarkMode 
                ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700' 
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title={isDarkMode ? 'Switch to Light/White Theme' : 'Switch to Dark Theme'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          <div className="text-right text-xs hidden sm:block">
            <div className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{user.name}</div>
            <div className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</div>
          </div>
          <button
            onClick={onSignOut}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border-slate-700'
                : 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border-slate-200'
            }`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
              }`}>
                <div>
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Campus Smart Bins</p>
                  <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>248 Bins</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Active Telemetry</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600">
                  <Trash2 className="w-5 h-5" />
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
              }`}>
                <div>
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Recycling Efficiency</p>
                  <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>78.4%</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">+4.2% this month</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
              }`}>
                <div>
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active Collection Fleet</p>
                  <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>12 Trucks</p>
                  <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>On Active Routes</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
                  <Truck className="w-5 h-5" />
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
              }`}>
                <div>
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Account Authorization</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">VIEWER</p>
                  <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Pending Role Promotion</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Read-Only Information Banner */}
            <div className={`rounded-2xl p-6 relative overflow-hidden border transition-colors ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-bold">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>EcoTrack Environmental Intelligence Platform</span>
                </div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Welcome, Viewer</h2>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  As a registered <strong>Viewer</strong>, you have access to read-only campus sustainability telemetry and waste analytics overview. Editing, administrative configuration, route optimization, and operational collection actions require elevated role permissions (`ANALYST`, `DRIVER`, or `ADMIN`).
                </p>
              </div>
            </div>

            {/* Public Campus Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`rounded-2xl p-5 space-y-4 border transition-colors ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <h3 className={`font-bold text-sm flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Campus Zone Health Overview</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className={`flex items-center justify-between p-3 rounded-xl border ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Academic & Library Zone</span>
                      <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>42 Smart Bins • Avg Fill: 48%</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                      Optimal
                    </span>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-xl border ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Hostels & Residential Zone</span>
                      <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>64 Smart Bins • Avg Fill: 72%</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-300">
                      Moderate
                    </span>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-xl border ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Cafeteria & East Campus</span>
                      <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>38 Smart Bins • Avg Fill: 84%</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-bold border border-red-300">
                      High Fill
                    </span>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl p-5 space-y-4 border transition-colors ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <h3 className={`font-bold text-sm flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Lock className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span>Role Permissions Matrix</span>
                </h3>
                <div className={`space-y-2.5 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div className={`flex items-center justify-between p-2.5 rounded-lg border ${
                    isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span>View Public Campus Telemetry</span>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className={`flex items-center justify-between p-2.5 rounded-lg border ${
                    isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span>Export Analytics & Generate Reports</span>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">Analyst / Admin</span>
                  </div>
                  <div className={`flex items-center justify-between p-2.5 rounded-lg border ${
                    isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span>Perform Bin Collection & Driver Routes</span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">Driver / Admin</span>
                  </div>
                  <div className={`flex items-center justify-between p-2.5 rounded-lg border ${
                    isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span>Manage Users, Roles & System Settings</span>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">Admin Only</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className={`rounded-2xl p-6 space-y-4 animate-in fade-in duration-200 border transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className={`text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Eye className="w-5 h-5 text-emerald-600" />
                  <span>Live Campus Telemetry & GIS Monitoring Map</span>
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Real-time IoT sensor telemetry, live vehicle location, and waste collection tracking.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-700 font-mono text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>LIVE TRUCK MOVEMENT (28 km/h)</span>
                </span>
              </div>
            </div>

            {/* Interactive Campus Map Canvas with Moving Truck */}
            <ViewerLiveCampusMap isDarkMode={isDarkMode} />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className={`rounded-2xl p-6 space-y-4 max-w-xl mx-auto animate-in fade-in duration-200 border transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <h3 className={`text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <User className="w-5 h-5 text-emerald-600" />
              <span>User Profile Details</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className={`p-3 rounded-xl border flex justify-between ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Full Name:</span>
                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user.name}</span>
              </div>
              <div className={`p-3 rounded-xl border flex justify-between ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Email Address:</span>
                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user.email}</span>
              </div>
              <div className={`p-3 rounded-xl border flex justify-between ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Current Role:</span>
                <span className="font-bold text-amber-700 font-mono">VIEWER</span>
              </div>
              <div className={`p-3 rounded-xl border flex justify-between ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Account Status:</span>
                <span className="font-bold text-emerald-600">{user.status || 'ACTIVE'}</span>
              </div>
              <div className={`p-3 rounded-xl border flex justify-between ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Organization:</span>
                <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{user.organization || 'EcoTrack AI'}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={`rounded-2xl p-6 space-y-4 max-w-xl mx-auto animate-in fade-in duration-200 border transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <h3 className={`text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Settings className="w-5 h-5 text-emerald-600" />
              <span>Viewer Preferences</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Email Notifications</p>
                  <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Receive campus sustainability updates</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-slate-300 bg-white text-emerald-600 w-4 h-4 cursor-pointer" />
              </div>
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Telemetry Unit</p>
                  <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Display capacity in Liters (L) or Metric Tons</p>
                </div>
                <select className={`rounded-lg px-2.5 py-1 text-xs font-bold border ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}>
                  <option value="L">Liters (L)</option>
                  <option value="KG">Kilograms (kg)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewerPortal;

