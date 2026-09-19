import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Eye,
  Edit,
  MapPin,
  History,
  AlertTriangle,
  Power,
} from 'lucide-react';
import type { SmartBin } from '../../../types/bin';
import { BinFillIndicator } from './BinFillIndicator';

interface BinTableRowProps {
  bin: SmartBin;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onViewDetails: (bin: SmartBin) => void;
  onEditBin: (bin: SmartBin) => void;
  onViewLocation: (bin: SmartBin) => void;
  onViewHistory: (bin: SmartBin) => void;
  onPrioritize: (bin: SmartBin) => void;
  onDeactivate: (bin: SmartBin) => void;
}

export const BinTableRow: React.FC<BinTableRowProps> = ({
  bin,
  isSelected,
  onToggleSelect,
  onViewDetails,
  onEditBin,
  onViewLocation,
  onViewHistory,
  onPrioritize,
  onDeactivate,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Status Dot & Badge
  let statusBadge = (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      {bin.status.toUpperCase()}
    </span>
  );

  if (bin.status === 'Critical') {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
        CRITICAL
      </span>
    );
  } else if (bin.status === 'Warning') {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        WARNING
      </span>
    );
  } else if (bin.status === 'Normal') {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-[#047857] border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        NORMAL
      </span>
    );
  } else if (bin.status === 'Offline') {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-300">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        OFFLINE
      </span>
    );
  }


  return (
    <tr
      className={`hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs ${
        isSelected ? 'bg-emerald-50/40' : ''
      }`}
    >
      {/* Checkbox */}
      <td className="p-3 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(bin.id)}
          className="rounded border-slate-300 text-[#047857] focus:ring-[#047857] cursor-pointer"
        />
      </td>

      {/* Status */}
      <td className="py-3 px-2 whitespace-nowrap">{statusBadge}</td>

      {/* Bin ID (JetBrains Mono) */}
      <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
        <button
          onClick={() => onViewDetails(bin)}
          className="hover:text-[#047857] hover:underline cursor-pointer border-none bg-transparent p-0 font-mono font-bold text-slate-900"
        >
          {bin.id}
        </button>
      </td>

      {/* Location */}
      <td className="py-3 px-3">
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 truncate max-w-[170px]" title={bin.address}>
            {bin.address}
          </span>
          {bin.name && (
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[170px]">
              {bin.name}
            </span>
          )}
        </div>
      </td>

      {/* Zone */}
      <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
        {bin.zone}
      </td>

      {/* Fill Level */}
      <td className="py-3 px-3 whitespace-nowrap">
        <BinFillIndicator percent={bin.currentFillPercent} />
      </td>

      {/* Actions Menu */}
      <td className="py-3 px-3 text-right whitespace-nowrap relative">
        <div className="flex items-center justify-end gap-1.5" ref={menuRef}>
          <button
            onClick={() => onViewDetails(bin)}
            className="px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-md cursor-pointer transition-colors inline-flex items-center gap-1"
            title="View Bin Details"
          >
            <Eye className="w-3 h-3" />
            <span>Details</span>
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer border-none bg-transparent"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-left text-xs font-semibold text-slate-700 animate-fadeIn">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onViewDetails(bin);
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-100 flex items-center gap-2 cursor-pointer border-none bg-transparent text-slate-700"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>View Details</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEditBin(bin);
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-100 flex items-center gap-2 cursor-pointer border-none bg-transparent text-slate-700"
              >
                <Edit className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Bin</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onViewLocation(bin);
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-100 flex items-center gap-2 cursor-pointer border-none bg-transparent text-slate-700"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>View Location</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onViewHistory(bin);
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-100 flex items-center gap-2 cursor-pointer border-none bg-transparent text-slate-700"
              >
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>View History</span>
              </button>

              {(bin.status === 'Critical' || bin.status === 'Warning') && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onPrioritize(bin);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-amber-50 text-amber-800 flex items-center gap-2 cursor-pointer border-none bg-transparent"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Prioritize Collection</span>
                </button>
              )}

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDeactivate(bin);
                }}
                className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer border-none bg-transparent"
              >
                <Power className="w-3.5 h-3.5 text-red-500" />
                <span>Deactivate Bin</span>
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};
