import React from 'react';
import { Eye, MapPin } from 'lucide-react';
import type { BinStop } from '../../mock/routeData';

interface RouteStopsTableProps {
  stops: BinStop[];
  onViewStopBin: (stop: BinStop) => void;
  selectedBinId?: string;
}

export const RouteStopsTable: React.FC<RouteStopsTableProps> = ({
  stops,
  onViewStopBin,
  selectedBinId,
}) => {
  return (
    <div className="bg-white rounded-md border border-[#e5e7eb] shadow-xs p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#738a62]" />
          <h3 className="text-sm font-bold text-[#111827] m-0">Route Stops Sequence</h3>
          <span className="text-xs text-[#6b7280] font-medium">({stops.length} Total Stops)</span>
        </div>
      </div>

      {stops.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#6b7280]">
          No stops found for the selected route or filter criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#e5e7eb] text-[#6b7280] font-bold uppercase text-[10px]">
                <th className="pb-2.5 pt-1 px-2">Priority</th>
                <th className="pb-2.5 pt-1 px-2">Stop Location</th>
                <th className="pb-2.5 pt-1 px-2">Bin ID</th>
                <th className="pb-2.5 pt-1 px-2">Zone</th>
                <th className="pb-2.5 pt-1 px-2">Fill Level</th>
                <th className="pb-2.5 pt-1 px-2">Waste Type</th>
                <th className="pb-2.5 pt-1 px-2">Status</th>
                <th className="pb-2.5 pt-1 px-2">ETA</th>
                <th className="pb-2.5 pt-1 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6] font-medium text-[#374151]">
              {stops.map((stop, idx) => {
                const isSelected = selectedBinId === stop.binId;
                const isP1 = stop.priority === 'Critical' || stop.fillLevel >= 90;

                return (
                  <tr
                    key={stop.id}
                    className={`transition-colors hover:bg-[#f9fafb] ${
                      isSelected ? 'bg-emerald-50/60' : ''
                    }`}
                  >
                    {/* Priority P1/P2 */}
                    <td className="py-2.5 px-2 font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${
                          isP1 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isP1 ? 'P1' : 'P2'}
                      </span>
                    </td>

                    {/* Stop Name */}
                    <td className="py-2.5 px-2 font-bold text-[#111827]">
                      {idx + 1}. {stop.location}
                    </td>

                    {/* Bin ID */}
                    <td className="py-2.5 px-2 font-mono text-[#4b5563]">{stop.binId}</td>

                    {/* Zone */}
                    <td className="py-2.5 px-2 text-[#6b7280]">{stop.zone}</td>

                    {/* Fill Level Bar */}
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            stop.fillLevel >= 85
                              ? 'text-red-600'
                              : stop.fillLevel >= 70
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {stop.fillLevel}%
                        </span>
                        <div className="w-16 h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              stop.fillLevel >= 85
                                ? 'bg-red-600'
                                : stop.fillLevel >= 70
                                ? 'bg-amber-500'
                                : 'bg-emerald-600'
                            }`}
                            style={{ width: `${stop.fillLevel}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Waste Type */}
                    <td className="py-2.5 px-2 text-[#4b5563]">{stop.wasteType}</td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          stop.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : stop.status === 'Pending'
                            ? 'bg-blue-100 text-blue-800'
                            : stop.status === 'Skipped'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {stop.status}
                      </span>
                    </td>

                    {/* ETA */}
                    <td className="py-2.5 px-2 text-[#6b7280] font-mono">{stop.eta}</td>

                    {/* Action button */}
                    <td className="py-2.5 px-2 text-right">
                      <button
                        onClick={() => onViewStopBin(stop)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#374151] hover:text-[#111827] bg-white hover:bg-[#f3f4f6] border border-[#d1d5db] rounded cursor-pointer shadow-xs inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-[#738a62]" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
