import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, MapPin } from 'lucide-react';
import type { ZoneDemand } from '../../../types/planning';

interface ZoneDemandTableProps {
  zones: ZoneDemand[];
  onSelectZone: (zone: ZoneDemand) => void;
}

export const ZoneDemandTable: React.FC<ZoneDemandTableProps> = ({ zones, onSelectZone }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof ZoneDemand>('expectedWasteTons');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredZones = useMemo(() => {
    return zones
      .filter((zone) => {
        const name = zone.zoneName || zone.zone || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || zone.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const valA = (a[sortField] ?? 0) as number | string;
        const valB = (b[sortField] ?? 0) as number | string;
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [zones, searchTerm, statusFilter, sortField, sortDirection]);

  const handleSort = (field: keyof ZoneDemand) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Header Bar */}
      <div className="p-6 border-b border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-emerald-400" />
            Zone Collection Demand
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Detailed breakdown of fill levels, priority bins, and required fleet capacity per municipal zone.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-800 text-white border border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-slate-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 text-white border border-slate-700 rounded-lg text-xs px-3 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="All">Status: All</option>
            <option value="HIGH DEMAND">HIGH DEMAND</option>
            <option value="WATCH">WATCH</option>
            <option value="READY">READY</option>
            <option value="CONFLICT">CONFLICT</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('zoneName')}>
                <div className="flex items-center space-x-1">
                  <span>Zone</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Total Bins</th>
              <th className="py-3 px-4">Current Fill</th>
              <th className="py-3 px-4">Predicted Fill</th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('expectedWasteTons')}>
                <div className="flex items-center space-x-1">
                  <span>Expected Waste</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Priority Bins</th>
              <th className="py-3 px-4">Overflow Risk</th>
              <th className="py-3 px-4">Req. Capacity</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {filteredZones.map((zone) => {
              const name = zone.zoneName || zone.zone || 'Unknown';
              const bins = zone.totalBins || zone.binsCount || 0;
              const curFill = zone.currentFillPct ?? zone.currentFill ?? 0;
              const predFill = zone.predictedFillPct ?? zone.predictedFill ?? 0;
              const pBins = zone.priorityBins ?? zone.priorityBinsCount ?? 0;

              return (
                <tr
                  key={zone.id}
                  onClick={() => onSelectZone(zone)}
                  className="hover:bg-slate-50 transition cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center space-x-2">
                    <span>{name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">{bins}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{curFill}%</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{predFill}%</td>
                  <td className="py-3.5 px-4 font-mono text-slate-900 font-semibold">{zone.expectedWasteTons} t</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">{pBins}</td>
                  
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                      zone.overflowRisk === 'High' ? 'bg-red-100 text-red-700' :
                      zone.overflowRisk === 'Medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {zone.overflowRisk}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{zone.requiredCapacityTons} t</td>

                  <td className="py-3.5 px-4 text-right">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                      zone.status === 'READY' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      zone.status === 'HIGH DEMAND' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      zone.status === 'WATCH' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {zone.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
