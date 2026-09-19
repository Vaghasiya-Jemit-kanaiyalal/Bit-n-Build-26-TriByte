import React, { useState } from 'react';
import {
  Leaf,
  LayoutDashboard,
  Trash2,
  MapPin,
  Truck,
  Route,
  Recycle,
  BarChart3,
  Bell,
  Users,
  Grid,
  Settings,
  Search,
  AlertTriangle,
  Layers,
  ChevronDown,
  LogOut,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity
} from 'lucide-react';
import type { UserSession } from '../../types/auth';

interface EcoTrackDashboardProps {
  user: UserSession;
  onSignOut: () => void;
}

export const EcoTrackDashboard: React.FC<EcoTrackDashboardProps> = ({ user, onSignOut }) => {
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [mapType, setMapType] = useState<'map' | 'satellite'>('map');
  const [timeFilter, setTimeFilter] = useState<'This Week' | 'This Month'>('This Week');

  const navMain = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Bins', icon: Trash2 },
    { name: 'Bin Map', icon: MapPin },
    { name: 'Collections', icon: Truck },
    { name: 'Routes', icon: Route },
    { name: 'Fleet', icon: Truck },
    { name: 'Recycling', icon: Recycle },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Alerts', icon: Bell },
  ];

  const navAdmin = [
    { name: 'Users', icon: Users },
    { name: 'Areas & Zones', icon: Grid },
    { name: 'Waste Categories', icon: Layers },
    { name: 'Settings', icon: Settings },
  ];

  const upcomingCollections = [
    { id: 'CSE-001', location: 'CSE Block', fill: '92%', eta: '1 hr', priority: 'High', priorityBg: 'bg-red-100 text-red-700' },
    { id: 'H-104', location: 'Hostel A', fill: '88%', eta: '2 hrs', priority: 'High', priorityBg: 'bg-red-100 text-red-700' },
    { id: 'LIB-005', location: 'Library', fill: '74%', eta: '4 hrs', priority: 'Medium', priorityBg: 'bg-amber-100 text-amber-800' },
    { id: 'S-05', location: 'Sports Complex', fill: '70%', eta: '5 hrs', priority: 'Medium', priorityBg: 'bg-amber-100 text-amber-800' },
    { id: 'CAF-01', location: 'Cafeteria', fill: '62%', eta: '6 hrs', priority: 'Low', priorityBg: 'bg-emerald-100 text-emerald-800' },
  ];

  const attentionBins = [
    { id: 'Bin CSE-001', fill: '92% Full', color: 'bg-red-500', loc: 'CSE Block', overflow: 'Predicted overflow in 4 hours' },
    { id: 'Bin H-104', fill: '88% Full', color: 'bg-red-500', loc: 'Hostel Block A', overflow: 'Predicted overflow in 6 hours' },
    { id: 'Bin LIB-005', fill: '74% Full', color: 'bg-amber-500', loc: 'Library', overflow: 'Predicted overflow in 1 day' },
    { id: 'Bin S-05', fill: '70% Full', color: 'bg-amber-500', loc: 'Sports Complex', overflow: 'Predicted overflow in 1 day' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-row overflow-x-hidden">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0 shadow-sm z-20">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-2 py-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#047857] flex items-center justify-center shadow-md">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-[#064e3b] leading-tight tracking-tight">EcoTrack</span>
              <span className="text-[11px] font-semibold text-slate-500 leading-none">Waste Management</span>
            </div>
          </div>

          {/* MAIN Navigation */}
          <div className="mb-6">
            <span className="px-2 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block mb-2">MAIN</span>
            <nav className="flex flex-col gap-1">
              {navMain.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveTab(item.name)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                      isActive
                        ? 'bg-emerald-50 text-[#047857]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-[#047857]' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ADMINISTRATION Navigation */}
          <div>
            <span className="px-2 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block mb-2">ADMINISTRATION</span>
            <nav className="flex flex-col gap-1">
              {navAdmin.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveTab(item.name)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                      isActive
                        ? 'bg-emerald-50 text-[#047857]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-[#047857]' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Tagline */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 px-2 text-slate-500">
          <Leaf className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-700 leading-tight">Cleaner Today</span>
            <span className="text-[10px] font-semibold text-slate-500 leading-tight">Greener Tomorrow</span>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-10 shadow-xs">
          {/* Search Bar */}
          <div className="relative flex items-center max-w-md w-full">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              placeholder="Search bins, locations, vehicles, or reports..."
              type="text"
              className="w-full pl-10 pr-4 py-2 bg-slate-100/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-transparent focus:outline-none focus:bg-white focus:border-slate-300 transition-all"
            />
          </div>

          {/* Right Status Controls */}
          <div className="flex items-center gap-4 shrink-0">
            {/* High Priority Tag */}
            <div className="hidden md:flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>High - 74/100</span>
            </div>

            {/* Date Time */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span>Sep 19, 2026 11:24 AM</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer border-none bg-transparent">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-[#064e3b] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'JV'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">{user.name || 'Jemit Vaghasiya'}</span>
                <span className="text-[10px] text-slate-500 font-semibold leading-tight">{user.role || 'Waste Manager'}</span>
              </div>
              <button
                onClick={onSignOut}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer border-none bg-transparent ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <main className="p-6 flex-1 flex flex-col gap-6 max-w-7xl w-full mx-auto">
          
          {/* Header Title */}
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight m-0">
              Waste Management Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Monitor real-time waste levels, identify operational issues, and take targeted action.
            </p>
          </div>

          {/* ALERT BANNER */}
          <div className="bg-red-50/80 border border-red-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-red-950">28 BINS NEAR OVERFLOW</span>
                  <span className="bg-red-200 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">High Priority</span>
                </div>
                <p className="text-xs text-red-800 font-medium mt-1">
                  Bins in CSE Block, Hostel Block A and 3 other areas are above 80% capacity. Immediate collection required to prevent overflow and maintain campus cleanliness.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button className="flex-1 sm:flex-initial px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 shadow-sm cursor-pointer">
                View Alerts
              </button>
              <button className="flex-1 sm:flex-initial px-4 py-2 bg-[#064e3b] text-white hover:bg-[#047857] rounded-xl text-xs font-bold shadow-md cursor-pointer border-none flex items-center justify-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                <span>Take Action</span>
              </button>
            </div>
          </div>

          {/* 5 KEY METRICS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* Card 1: Total Bins */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-slate-900 leading-tight">1,245</span>
                <span className="text-[11px] font-semibold text-slate-500">Total Bins</span>
                <span className="text-[10px] font-bold text-emerald-600 mt-0.5">↑ 12% from last month</span>
              </div>
            </div>

            {/* Card 2: Active Bins */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-slate-900 leading-tight">892</span>
                <span className="text-[11px] font-semibold text-slate-500">Active Bins</span>
                <span className="text-[10px] font-bold text-slate-600 mt-0.5">72% of total</span>
              </div>
            </div>

            {/* Card 3: Near Overflow */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-red-600 leading-tight">28</span>
                <span className="text-[11px] font-semibold text-slate-500">Near Overflow</span>
                <span className="text-[10px] font-bold text-red-600 mt-0.5">2.3% of total</span>
              </div>
            </div>

            {/* Card 4: Active Vehicles */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-slate-900 leading-tight">8</span>
                <span className="text-[11px] font-semibold text-slate-500">Active Vehicles</span>
                <span className="text-[10px] font-bold text-slate-600 mt-0.5">6 on route</span>
              </div>
            </div>

            {/* Card 5: Recycled */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5 col-span-2 md:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Recycle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-slate-900 leading-tight">3.4 Tons</span>
                <span className="text-[11px] font-semibold text-slate-500">Recycled This Week</span>
                <span className="text-[10px] font-bold text-emerald-600 mt-0.5">↑ 18% from last week</span>
              </div>
            </div>
          </div>

          {/* MIDDLE SECTION (GRID OF 3 VISUAL CARDS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LIVE BIN MAP (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 m-0">Live Bin Map</h3>
                </div>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setMapType('map')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md cursor-pointer border-none ${
                      mapType === 'map' ? 'bg-[#064e3b] text-white' : 'text-slate-600 hover:text-slate-900 bg-transparent'
                    }`}
                  >
                    Map
                  </button>
                  <button
                    onClick={() => setMapType('satellite')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md cursor-pointer border-none ${
                      mapType === 'satellite' ? 'bg-[#064e3b] text-white' : 'text-slate-600 hover:text-slate-900 bg-transparent'
                    }`}
                  >
                    Satellite
                  </button>
                </div>
              </div>

              {/* Map Canvas Graphic Container */}
              <div className="relative w-full h-56 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-60"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop')`,
                  }}
                />
                
                {/* SVG Route Line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path d="M 80 140 L 160 170 L 220 110 L 270 70" stroke="#2563eb" strokeWidth="3" strokeDasharray="6 4" fill="none" />
                </svg>

                {/* Map Pins */}
                <div className="absolute top-8 left-12 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                  45% Academic
                </div>
                <div className="absolute top-10 right-28 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md animate-bounce">
                  92% CSE
                </div>
                <div className="absolute top-6 right-12 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                  78% Hostel A
                </div>
                <div className="absolute bottom-10 left-32 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                  52% Library
                </div>
                <div className="absolute bottom-8 right-8 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                  30% Sports
                </div>

                {/* Truck Marker */}
                <div className="absolute top-24 left-36 bg-blue-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                  <Truck className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Map Legend */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Normal &lt; 60%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Moderate 60-80%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  <span>High &gt; 80%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3 h-3 text-blue-600" />
                  <span>Vehicle</span>
                </div>
              </div>
            </div>

            {/* COLLECTION STATUS (3.5 cols) */}
            <div className="lg:col-span-3.5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900 m-0">Collection Status</h3>
                <span className="text-xs font-bold text-[#047857] hover:underline cursor-pointer">View All &rarr;</span>
              </div>

              {/* Donut Chart Visual Graphic */}
              <div className="flex items-center justify-center relative py-4">
                <div className="w-36 h-36 rounded-full border-12 border-emerald-600 border-t-amber-500 border-r-blue-500 border-b-emerald-600 flex items-center justify-center relative shadow-inner">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-extrabold text-slate-900">64%</span>
                    <span className="text-[10px] font-bold text-slate-400">Completed</span>
                  </div>
                </div>
              </div>

              {/* Stats breakdown */}
              <div className="space-y-1.5 text-xs font-semibold">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span className="text-slate-600">Completed</span>
                  </div>
                  <span className="font-bold text-slate-900">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-slate-600">In Progress</span>
                  </div>
                  <span className="font-bold text-slate-900">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-600">Pending</span>
                  </div>
                  <span className="font-bold text-slate-900">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    <span className="text-slate-600">Overdue</span>
                  </div>
                  <span className="font-bold text-slate-900">3</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>20 of 28 collections completed</span>
                  <span className="text-[#047857]">71%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#047857] w-[71%] rounded-full" />
                </div>
              </div>
            </div>

            {/* WASTE COMPOSITION (3.5 cols) */}
            <div className="lg:col-span-3.5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900 m-0">Waste Composition</h3>
                <span className="text-xs font-bold text-slate-500 cursor-pointer flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                  {timeFilter} <ChevronDown className="w-3 h-3" />
                </span>
              </div>

              {/* Donut Chart Visual Graphic */}
              <div className="flex items-center justify-center relative py-4">
                <div className="w-36 h-36 rounded-full border-12 border-emerald-500 border-r-blue-500 border-b-amber-500 border-l-purple-500 flex items-center justify-center relative shadow-inner">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-extrabold text-slate-900">3.4</span>
                    <span className="text-[10px] font-bold text-slate-400">Tons</span>
                  </div>
                </div>
              </div>

              {/* Legend List */}
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span className="text-slate-600">Organic</span>
                  </div>
                  <span className="font-bold text-slate-900">32%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-slate-600">Plastic</span>
                  </div>
                  <span className="font-bold text-slate-900">28%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-600">Paper</span>
                  </div>
                  <span className="font-bold text-slate-900">18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span className="text-slate-600">Metal</span>
                  </div>
                  <span className="font-bold text-slate-900">12%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span className="text-slate-600">Glass</span>
                  </div>
                  <span className="font-bold text-slate-900">6%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                    <span className="text-slate-600">Other</span>
                  </div>
                  <span className="font-bold text-slate-900">4%</span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION (GRID OF 3 CARDS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Requires Attention (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 m-0">Requires Attention (4)</h3>
                </div>
                <span className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer">View All &rarr;</span>
              </div>

              <div className="space-y-2.5">
                {attentionBins.map((bin, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${bin.color} shrink-0`} />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{bin.id}</span>
                          <span className="text-[10px] font-extrabold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">{bin.fill}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">{bin.loc} &bull; {bin.overflow}</span>
                      </div>
                    </div>
                    <button className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white rounded-lg border border-slate-200 cursor-pointer shadow-xs">
                      View Details &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Collections (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 m-0">Upcoming Collections</h3>
                </div>
                <span className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer">View All &rarr;</span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="pb-2">Bin ID</th>
                      <th className="pb-2">Location</th>
                      <th className="pb-2">Fill Level</th>
                      <th className="pb-2">ETA</th>
                      <th className="pb-2 text-right">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {upcomingCollections.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="py-2 font-bold text-slate-900">{row.id}</td>
                        <td className="py-2 text-slate-600">{row.location}</td>
                        <td className="py-2 font-bold text-red-600">{row.fill}</td>
                        <td className="py-2 text-slate-500">{row.eta}</td>
                        <td className="py-2 text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${row.priorityBg}`}>
                            {row.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Insights & Recent Activity (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              
              {/* AI Insights */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-slate-900 m-0">AI Insights</h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 hover:text-slate-900 cursor-pointer">View All &rarr;</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-slate-700">
                    <strong className="text-emerald-900 block mb-0.5">Hostel Area waste generation increased by 34% between 7 PM - 10 PM.</strong>
                    <span>Recommendation: Increase collection frequency during this period.</span>
                  </div>
                  <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-slate-700">
                    <strong className="text-blue-900 block mb-0.5">Plastic waste in Academic Block increased by 22% this week.</strong>
                    <span>Recommendation: Add one more plastic recycling bin near the cafeteria.</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-900 m-0">Recent Activity</h3>
                  <span className="text-[11px] font-bold text-slate-500 hover:text-slate-900 cursor-pointer">View All &rarr;</span>
                </div>
                <div className="space-y-2 text-xs text-slate-600 font-medium">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Vehicle V-03 started collection route</span>
                    </span>
                    <span className="text-[10px] text-slate-400">10:32 AM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Bin H-203 marked as collected (120 kg)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">09:15 AM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>New alert generated for Bin CSE-001</span>
                    </span>
                    <span className="text-[10px] text-slate-400">08:47 AM</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default EcoTrackDashboard;
