import React, { useState } from 'react';
import type { ClassificationEvent, WasteType, ClassificationStatus } from '../../../types/classification';
import { History, Search, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface ClassificationHistoryTableProps {
  history: ClassificationEvent[];
  onSelectEvent: (event: ClassificationEvent) => void;
  onExportCSV: () => void;
}

export const ClassificationHistoryTable: React.FC<ClassificationHistoryTableProps> = ({
  history,
  onSelectEvent,
  onExportCSV,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState<WasteType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<ClassificationStatus | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<'latest' | 'oldest' | 'highConf' | 'lowConf' | 'weight'>('latest');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter logic
  let filtered = history.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        item.id.toLowerCase().includes(q) ||
        item.binId.toLowerCase().includes(q) ||
        item.zone.toLowerCase().includes(q) ||
        item.detectedCategory.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (zoneFilter !== 'ALL' && item.zone !== zoneFilter) return false;
    if (categoryFilter !== 'ALL' && item.detectedCategory !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    return true;
  });

  // Sort logic
  filtered.sort((a, b) => {
    if (sortField === 'highConf') return b.confidence - a.confidence;
    if (sortField === 'lowConf') return a.confidence - b.confidence;
    if (sortField === 'weight') return b.estimatedWeightKg - a.estimatedWeightKg;
    if (sortField === 'oldest') return a.id.localeCompare(b.id);
    return b.id.localeCompare(a.id); // default latest
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const zones = ['ALL', 'Central Zone', 'North Zone', 'South Zone', 'East Zone', 'West Zone', 'Industrial Zone', 'Residential Zone'];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Historical Waste Classification Logs</h3>
        </div>

        <button
          onClick={onExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Logs CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search Classification ID or Bin ID..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none text-xs"
          />
        </div>

        {/* Zone Filter */}
        <select
          value={zoneFilter}
          onChange={(e) => {
            setZoneFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 font-semibold focus:outline-none"
        >
          {zones.map((z) => (
            <option key={z} value={z}>
              {z === 'ALL' ? 'All Zones' : z}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value as WasteType | 'ALL');
            setCurrentPage(1);
          }}
          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 font-semibold focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="PLASTIC">Plastic</option>
          <option value="PAPER">Paper</option>
          <option value="METAL">Metal</option>
          <option value="GLASS">Glass</option>
          <option value="ORGANIC">Organic</option>
          <option value="OTHER">Other</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as ClassificationStatus | 'ALL');
            setCurrentPage(1);
          }}
          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 font-semibold focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="LOW_CONFIDENCE">Low Confidence</option>
          <option value="MIXED">Mixed</option>
          <option value="REVIEW">Review</option>
        </select>

        {/* Sort Select */}
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as any)}
          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 font-semibold focus:outline-none"
        >
          <option value="latest">Sort: Latest</option>
          <option value="oldest">Sort: Oldest</option>
          <option value="highConf">Sort: Highest Confidence</option>
          <option value="lowConf">Sort: Lowest Confidence</option>
          <option value="weight">Sort: Highest Weight</option>
        </select>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[850px]">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
              <th className="pb-3">ID</th>
              <th className="pb-3">Date & Time</th>
              <th className="pb-3">Bin ID</th>
              <th className="pb-3">Zone</th>
              <th className="pb-3">Category</th>
              <th className="pb-3 text-right">Confidence</th>
              <th className="pb-3 text-right">Weight</th>
              <th className="pb-3">Source</th>
              <th className="pb-3 text-center">Status</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium font-mono">
            {paginated.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelectEvent(item)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="py-2.5 font-bold text-slate-900">{item.id}</td>
                <td className="py-2.5 text-slate-500">{item.timestamp}</td>
                <td className="py-2.5 font-bold text-slate-800">{item.binId}</td>
                <td className="py-2.5 font-sans text-slate-700">{item.zone}</td>
                <td className="py-2.5 font-sans">
                  <span className="font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800 border border-slate-200">
                    {item.detectedCategory}
                  </span>
                </td>
                <td className="py-2.5 text-right font-bold text-emerald-700">{item.confidence}%</td>
                <td className="py-2.5 text-right font-bold text-slate-900">{item.estimatedWeightKg} kg</td>
                <td className="py-2.5 font-sans text-slate-600">{item.source}</td>
                <td className="py-2.5 text-center font-sans">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                      item.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'LOW_CONFIDENCE'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <button className="text-slate-400 hover:text-slate-900 p-1 rounded hover:bg-slate-100">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-2 text-xs text-slate-500 font-mono">
        <span>
          Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} logs
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 text-slate-600 border border-slate-200 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-slate-900">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1 text-slate-600 border border-slate-200 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
