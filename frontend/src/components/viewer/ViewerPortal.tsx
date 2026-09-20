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
} from 'lucide-react';
import NotificationToast from '../common/NotificationToast';

interface ViewerPortalProps {
  user: UserSession;
  onSignOut: () => void;
}

export const ViewerPortal: React.FC<ViewerPortalProps> = ({ user, onSignOut }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'monitoring' | 'profile' | 'settings'>('overview');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <NotificationToast />

      {/* Top Banner for Viewer Role Notice */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>READ-ONLY VIEWER ACCESS:</strong> Your account is currently in Viewer mode. An Administrator can promote your account to Analyst, Driver, or Manager.
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[11px] font-mono font-bold uppercase">
          Role: VIEWER
        </span>
      </div>

      {/* Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">EcoTrack AI</h1>
            <p className="text-[11px] text-slate-400">Public & Viewer Overview Console</p>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'monitoring'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Campus Monitoring
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Profile
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Settings
          </button>
        </nav>

        {/* User Account Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right text-xs hidden sm:block">
            <div className="font-bold text-slate-200">{user.name}</div>
            <div className="text-[11px] text-slate-400">{user.email}</div>
          </div>
          <button
            onClick={onSignOut}
            className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 transition-colors cursor-pointer"
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
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Campus Smart Bins</p>
                  <p className="text-2xl font-bold text-white mt-1">248 Bins</p>
                  <p className="text-[11px] text-emerald-400 mt-0.5">Active Telemetry</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Trash2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Recycling Efficiency</p>
                  <p className="text-2xl font-bold text-white mt-1">78.4%</p>
                  <p className="text-[11px] text-emerald-400 mt-0.5">+4.2% this month</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Active Collection Fleet</p>
                  <p className="text-2xl font-bold text-white mt-1">12 Trucks</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">On Active Routes</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Truck className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Account Authorization</p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">VIEWER</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pending Role Promotion</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Read-Only Information Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <Activity className="w-3.5 h-3.5" />
                  <span>EcoTrack Environmental Intelligence Platform</span>
                </div>
                <h2 className="text-xl font-bold text-white">Welcome, {user.name}</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  As a registered <strong>Viewer</strong>, you have access to read-only campus sustainability telemetry and waste analytics overview. Editing, administrative configuration, route optimization, and operational collection actions require elevated role permissions (`ANALYST`, `DRIVER`, or `ADMIN`).
                </p>
              </div>
            </div>

            {/* Public Campus Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Campus Zone Health Overview</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="font-bold text-white">Academic & Library Zone</span>
                      <p className="text-[11px] text-slate-400">42 Smart Bins • Avg Fill: 48%</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold">
                      Optimal
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="font-bold text-white">Hostels & Residential Zone</span>
                      <p className="text-[11px] text-slate-400">64 Smart Bins • Avg Fill: 72%</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-bold">
                      Moderate
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="font-bold text-white">Cafeteria & East Campus</span>
                      <p className="text-[11px] text-slate-400">38 Smart Bins • Avg Fill: 84%</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-[11px] font-bold">
                      High Fill
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Role Permissions Matrix</span>
                </h3>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span>View Public Campus Telemetry</span>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span>Export Analytics & Generate Reports</span>
                    <span className="text-[11px] font-bold text-purple-400">Analyst / Admin</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span>Perform Bin Collection & Driver Routes</span>
                    <span className="text-[11px] font-bold text-emerald-400">Driver / Admin</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span>Manage Users, Roles & System Settings</span>
                    <span className="text-[11px] font-bold text-amber-400">Admin Only</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              <span>Read-Only Campus Monitoring Feed</span>
            </h3>
            <p className="text-xs text-slate-400">
              Live operational monitoring view for campus sustainability tracking.
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-200">Campus Sensor Grid Operational</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                248 IoT Smart Bins reporting via WebSocket telemetry. Operational edits or bin allocation require Admin permissions.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-xl mx-auto animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" />
              <span>User Profile Details</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Full Name:</span>
                <span className="font-bold text-white">{user.name}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Email Address:</span>
                <span className="font-bold text-white">{user.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Current Role:</span>
                <span className="font-bold text-amber-400 font-mono">VIEWER</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Account Status:</span>
                <span className="font-bold text-emerald-400">{user.status || 'ACTIVE'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Organization:</span>
                <span className="font-bold text-slate-200">{user.organization || 'EcoTrack AI'}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-xl mx-auto animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-400" />
              <span>Viewer Preferences</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Email Notifications</p>
                  <p className="text-[11px] text-slate-400">Receive campus sustainability updates</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-emerald-500 w-4 h-4" />
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Telemetry Unit</p>
                  <p className="text-[11px] text-slate-400">Display capacity in Liters (L) or Metric Tons</p>
                </div>
                <select className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold">
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
