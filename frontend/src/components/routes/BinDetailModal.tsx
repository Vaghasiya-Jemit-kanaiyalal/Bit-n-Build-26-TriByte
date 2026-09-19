import React from 'react';
import { X, Trash2, AlertCircle } from 'lucide-react';
import type { BinStop } from '../../mock/routeData';

interface BinDetailModalProps {
  bin: BinStop | null;
  isOpen: boolean;
  onClose: () => void;
  routeName?: string;
}

export const BinDetailModal: React.FC<BinDetailModalProps> = ({
  bin,
  isOpen,
  onClose,
  routeName = 'RT-024',
}) => {
  if (!isOpen || !bin) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-[#e5e7eb] w-full max-w-md overflow-hidden flex flex-col text-xs text-[#374151]">
        
        {/* Header */}
        <div className="p-4 border-b border-[#e5e7eb] bg-[#f9fafb] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-[#738a62]" />
            <h3 className="text-base font-bold text-[#111827] m-0">Bin Telemetry &bull; {bin.binId}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#111827] border-none bg-transparent cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50/80 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <div>
                <span className="text-xs font-bold text-red-900 block">{bin.location}</span>
                <span className="text-[10px] text-red-700">Predicted Overflow in {bin.predictedOverflow}</span>
              </div>
            </div>
            <span className="text-lg font-extrabold text-red-600">{bin.fillLevel}%</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 p-3 bg-[#f9fafb] rounded border border-[#e5e7eb] text-xs">
            <div>
              <span className="text-[#6b7280] block text-[10px]">Zone</span>
              <span className="font-bold text-[#111827]">{bin.zone}</span>
            </div>
            <div>
              <span className="text-[#6b7280] block text-[10px]">Capacity</span>
              <span className="font-bold text-[#111827]">{bin.capacityLiters} L</span>
            </div>
            <div>
              <span className="text-[#6b7280] block text-[10px]">Waste Type</span>
              <span className="font-bold text-[#111827]">{bin.wasteType}</span>
            </div>
            <div>
              <span className="text-[#6b7280] block text-[10px]">Priority Level</span>
              <span className="font-bold text-red-600">{bin.priority}</span>
            </div>
            <div>
              <span className="text-[#6b7280] block text-[10px]">Collection Status</span>
              <span className="font-bold text-[#111827]">{bin.status}</span>
            </div>
            <div>
              <span className="text-[#6b7280] block text-[10px]">Assigned Route</span>
              <span className="font-bold text-[#738a62]">{routeName}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#e5e7eb] bg-[#f9fafb] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1f2937] text-white hover:bg-[#111827] font-semibold rounded cursor-pointer border-none text-xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
