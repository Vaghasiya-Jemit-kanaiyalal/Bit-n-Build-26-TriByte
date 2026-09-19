import React, { useState, useMemo } from 'react';
import {
  Eye,
  CheckCircle,
  Clock,
  CheckCheck,
  MoreVertical,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Radio,
  ExternalLink,
  ShieldAlert,
  X
} from 'lucide-react';
import type { AlertItem, AlertSeverity } from '../../mock/alertMockData';

interface AlertFeedTableProps {
  alerts: AlertItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onViewAlert: (alert: AlertItem) => void;
  onAcknowledge: (id: string) => void;
  onSnooze: (alert: AlertItem) => void;
  onResolve: (alert: AlertItem) => void;
  onToggleRead: (id: string, isRead: boolean) => void;
  onNavigateToResource: (alert: AlertItem) => void;
  onBulkAction: (action: 'read' | 'acknowledge' | 'snooze' | 'resolve') => void;
  onClearFilters: () => void;
}

type SortField = 'severity' | 'createdAt' | 'status' | 'type';

export const AlertFeedTable: React.FC<AlertFeedTableProps> = ({
  alerts,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onViewAlert,
  onAcknowledge,
  onSnooze,
  onResolve,
  onToggleRead,
  onNavigateToResource,
  onBulkAction,
  onClearFilters,
}) => {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortAsc, setSortAsc] = useState(false); // Newest first by default
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const severityWeight: Record<AlertSeverity, number> = {
    CRITICAL: 5,
    HIGH: 4,
    MEDIUM: 3,
    LOW: 2,
    INFO: 1,
  };

  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => {
      if (sortField === 'severity') {
        const valA = severityWeight[a.severity] || 0;
        const valB = severityWeight[b.severity] || 0;
        return sortAsc ? valA - valB : valB - valA;
      }
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [alerts, sortField, sortAsc]);

  const totalPages = Math.ceil(sortedAlerts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAlerts = sortedAlerts.slice(startIndex, startIndex + itemsPerPage);

  const isAllSelected = alerts.length > 0 && selectedIds.length === alerts.length;

  return (
    <div className="bg-white rounded-md border border-[#e5e7eb] shadow-2xs overflow-hidden">
      
      {/* Table Header Controls */}
      <div className="p-4 border-b border-[#e5e7eb] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider m-0">
            Alert Feed ({alerts.length})
          </h2>
          {selectedIds.length > 0 && (
            <span className="text-xs font-semibold text-[#738a62] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              {selectedIds.length} selected
            </span>
          )}
        </div>

        {/* Bulk Actions Toolbar */}
        {selectedIds.length > 0 ? (
          <div className="flex items-center space-x-2 animate-in fade-in duration-150">
            <button
              onClick={() => onBulkAction('read')}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-colors"
            >
              Mark Read
            </button>
            <button
              onClick={() => onBulkAction('acknowledge')}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-colors"
            >
              Acknowledge
            </button>
            <button
              onClick={() => onBulkAction('snooze')}
              className="px-2.5 py-1 text-xs font-semibold text-[#738a62] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
            >
              Snooze
            </button>
            <button
              onClick={() => onBulkAction('resolve')}
              className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
            >
              Resolve Selected
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-medium">Rows:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 font-semibold focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      {sortedAlerts.length === 0 ? (
        <div className="p-12 text-center text-slate-500 space-y-3">
          <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-800">No operational alerts match your current search or filters.</p>
          <p className="text-xs text-slate-500">Try clearing active filters to view all recorded incidents.</p>
          <button
            onClick={onClearFilters}
            className="px-3.5 py-1.5 bg-[#738a62] text-white rounded text-xs font-bold hover:bg-[#5f7350] transition-colors inline-flex items-center space-x-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#e5e7eb] text-[#6b7280] font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    className="rounded text-[#738a62] focus:ring-[#738a62] cursor-pointer"
                  />
                </th>

                <th className="py-3 px-3 cursor-pointer hover:bg-[#f3f4f6]" onClick={() => handleSort('severity')}>
                  <div className="flex items-center space-x-1">
                    <span>Severity</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="py-3 px-4">Alert Details</th>

                <th className="py-3 px-3 font-mono">Affected Entity</th>

                <th className="py-3 px-3">Location & Zone</th>

                <th className="py-3 px-3 cursor-pointer hover:bg-[#f3f4f6]" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center space-x-1">
                    <span>Created</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="py-3 px-3 cursor-pointer hover:bg-[#f3f4f6]" onClick={() => handleSort('status')}>
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e5e7eb] text-[#374151]">
              {paginatedAlerts.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isUnread = !item.isRead;

                let severityBadge = 'bg-slate-100 text-slate-700 border-slate-200';
                if (item.severity === 'CRITICAL') severityBadge = 'bg-red-100 text-red-800 border-red-200';
                if (item.severity === 'HIGH') severityBadge = 'bg-amber-100 text-amber-900 border-amber-200';
                if (item.severity === 'MEDIUM') severityBadge = 'bg-amber-50 text-amber-800 border-amber-200';
                if (item.severity === 'LOW') severityBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';

                let statusBadge = 'bg-slate-100 text-slate-700 border-slate-200';
                if (item.status === 'ACTIVE') statusBadge = 'bg-red-50 text-red-700 border-red-200';
                if (item.status === 'ACKNOWLEDGED') statusBadge = 'bg-amber-50 text-amber-800 border-amber-200';
                if (item.status === 'RESOLVED') statusBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                if (item.status === 'SNOOZED') statusBadge = 'bg-blue-50 text-blue-800 border-blue-200';

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#f9fafb] transition-colors group cursor-pointer ${
                      isUnread ? 'bg-slate-50/60 font-semibold' : ''
                    } ${isSelected ? 'bg-emerald-50/30' : ''}`}
                    onClick={() => onViewAlert(item)}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(item.id)}
                        className="rounded text-[#738a62] focus:ring-[#738a62] cursor-pointer"
                      />
                    </td>

                    {/* Severity Badge */}
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${severityBadge}`}>
                        {item.severity}
                      </span>
                    </td>

                    {/* Alert Details */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex flex-col space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs ${isUnread ? 'font-extrabold text-slate-900' : 'font-semibold text-[#111827]'} group-hover:text-[#738a62]`}>
                            {item.title}
                          </span>
                          {item.aiGenerated && (
                            <span className="inline-flex items-center text-[9px] font-mono font-bold px-1.5 py-0.2 bg-emerald-50 text-[#738a62] border border-emerald-200 rounded">
                              <Cpu className="w-2.5 h-2.5 mr-0.5" />
                              AI
                            </span>
                          )}
                          {item.source === 'Sensor' && (
                            <span className="inline-flex items-center text-[9px] font-mono font-bold px-1.5 py-0.2 bg-sky-50 text-sky-700 border border-sky-200 rounded">
                              <Radio className="w-2.5 h-2.5 mr-0.5" />
                              SENSOR
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#6b7280] line-clamp-1 font-normal leading-normal">
                          {item.description}
                        </p>
                      </div>
                    </td>

                    {/* Affected Entity ID */}
                    <td className="py-3.5 px-3 font-mono text-xs font-bold text-[#111827]">
                      {item.entityId}
                    </td>

                    {/* Location & Zone */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col text-[11px]">
                        <span className="text-slate-800 font-medium truncate max-w-[140px]">{item.location}</span>
                        <span className="text-slate-400 text-[10px]">{item.zone}</span>
                      </div>
                    </td>

                    {/* Created Timestamp */}
                    <td className="py-3.5 px-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {item.createdAt}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusBadge}`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Action Dropdown Menu */}
                    <td className="py-3.5 px-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-block text-left">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                          className="p-1 text-slate-400 hover:text-slate-900 rounded hover:bg-slate-100 cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === item.id && (
                          <div className="origin-top-right absolute right-0 mt-1 w-48 rounded-md shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-30 divide-y divide-slate-100 text-xs">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  onViewAlert(item);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-4 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>View Details</span>
                              </button>
                              <button
                                onClick={() => {
                                  onNavigateToResource(item);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-4 py-1.5 text-[#738a62] font-semibold hover:bg-emerald-50 flex items-center space-x-2"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-[#738a62]" />
                                <span>Go to Resource</span>
                              </button>
                            </div>

                            <div className="py-1">
                              {item.status === 'ACTIVE' && (
                                <button
                                  onClick={() => {
                                    onAcknowledge(item.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-1.5 text-amber-700 hover:bg-amber-50 flex items-center space-x-2"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Acknowledge</span>
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  onSnooze(item);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-4 py-1.5 text-blue-700 hover:bg-blue-50 flex items-center space-x-2"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Snooze Alert</span>
                              </button>
                              <button
                                onClick={() => {
                                  onResolve(item);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-4 py-1.5 text-emerald-700 hover:bg-emerald-50 flex items-center space-x-2"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Resolve Alert</span>
                              </button>
                            </div>

                            <div className="py-1">
                              <button
                                onClick={() => {
                                  onToggleRead(item.id, !item.isRead);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-4 py-1.5 text-slate-600 hover:bg-slate-50 flex items-center space-x-2"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Mark as {item.isRead ? 'Unread' : 'Read'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-[#e5e7eb] bg-[#f9fafb] flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({sortedAlerts.length} total)
          </span>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-[#d1d5db] bg-white text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-2.5 py-1 rounded border text-xs font-bold cursor-pointer ${
                  currentPage === page
                    ? 'bg-[#738a62] text-white border-[#738a62]'
                    : 'bg-white text-[#374151] border-[#d1d5db] hover:bg-[#f3f4f6]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-[#d1d5db] bg-white text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertFeedTable;
