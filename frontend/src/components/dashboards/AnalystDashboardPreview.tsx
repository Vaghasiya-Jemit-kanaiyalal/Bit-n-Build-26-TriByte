import React from 'react';
import { Download } from 'lucide-react';
import type { UserRole } from '../../types/auth';
import { showWebsiteToast } from '../common/NotificationToast';

interface DashboardProps {
  user: { name: string; email: string; role: UserRole; organization: string };
  onSignOut: () => void;
}

export const AnalystDashboardPreview: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col">
      {/* Analyst Header */}
      <header className="h-16 px-8 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <div className="font-extrabold text-base text-slate-900 tracking-tight">
            EcoTrack <span className="text-purple-700 font-black">ANALYTICS</span>
          </div>
          <span className="h-4 border-r border-slate-200" />
          <span className="text-xs text-slate-500 font-medium">
            {user.organization} — <strong className="text-slate-800 font-bold">SUPERVISOR & ANALYTICS PORTAL</strong>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900">{user.name}</div>
            <div className="font-mono text-[10px] font-bold text-purple-700 uppercase bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
              {user.role}
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-8 max-w-7xl mx-auto space-y-6 w-full flex-1">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Sustainability & Operations Analytics Console</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Real-time waste stream classification, recycling diversion rates, and environmental KPI telemetry.
            </p>
          </div>

          <button
            onClick={() => showWebsiteToast('Analyst report generated and exported to PDF.', 'success', 'Export Complete')}
            className="px-4 py-2 bg-[#047857] hover:bg-[#064e3b] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer border-none"
          >
            <Download className="w-4 h-4" /> Export Analytics Report
          </button>
        </div>

        {/* Analytics KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">WEEKLY DIVERSION RATE</div>
            <div className="text-2xl font-black text-emerald-700">
              74.2% <span className="text-xs font-bold text-emerald-600">(+4.8%)</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Diverted from Landfills</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">CO2 EMISSIONS REDUCTION</div>
            <div className="text-2xl font-black text-blue-700">
              -1.42 Tons <span className="text-xs font-bold text-blue-600">CO2e</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Fuel Route Optimization</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">AI CLASSIFICATION ACCURACY</div>
            <div className="text-2xl font-black text-purple-700">
              98.6% <span className="text-xs font-bold text-purple-600">Vision Model</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">14,280 Items Classified</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">CONTAMINATION ALERTS</div>
            <div className="text-2xl font-black text-amber-600">
              2 Flags <span className="text-xs font-bold text-amber-700">(Non-Recyclable)</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Inspection Required</div>
          </div>
        </div>

        {/* Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stream Breakdown */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">AI Waste Classification Stream Breakdown</h3>

            <div className="space-y-3.5 text-xs font-semibold">
              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Organic / Compostable</span>
                  <span className="font-mono font-bold text-emerald-700">42.5% (6.2 Tons)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-[42.5%] h-full bg-emerald-600 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Plastics (PET & HDPE)</span>
                  <span className="font-mono font-bold text-blue-700">28.1% (4.1 Tons)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-[28.1%] h-full bg-blue-600 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Paper & Cardboard</span>
                  <span className="font-mono font-bold text-amber-700">18.4% (2.7 Tons)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-[18.4%] h-full bg-amber-500 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>E-Waste & Batteries</span>
                  <span className="font-mono font-bold text-purple-700">6.2% (0.9 Tons)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-[6.2%] h-full bg-purple-600 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Supervisor Audit Log */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Supervisor Audit & Contamination Log</h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl">
                <div className="font-bold text-amber-950">BIN-104 Flagged for Plastic Contamination</div>
                <div className="text-[11px] text-amber-700 mt-0.5">10 mins ago • Cafeteria Recycling Unit</div>
              </div>

              <div className="p-3.5 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl">
                <div className="font-bold text-emerald-950">Weekly Diversion Milestone Achieved (&gt;70%)</div>
                <div className="text-[11px] text-emerald-700 mt-0.5">2 hours ago • System Auto Audit</div>
              </div>

              <div className="p-3.5 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
                <div className="font-bold text-blue-950">AI Vision Classification Retrained (v2.4.1)</div>
                <div className="text-[11px] text-blue-700 mt-0.5">Yesterday • Accuracy increased to 98.6%</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalystDashboardPreview;
