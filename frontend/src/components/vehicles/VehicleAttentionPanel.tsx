import React from 'react';
import { AlertTriangle, Wrench, Eye, Route } from 'lucide-react';
import type { VehicleAttentionItem } from '../../mock/vehicleData';

interface VehicleAttentionPanelProps {
  attentionItems: VehicleAttentionItem[];
  onActionClick?: (item: VehicleAttentionItem) => void;
  onSelectVehicle?: (vehId: string) => void;
  onSelectMaintenance?: (vehId: string) => void;
  onSelectRoute?: (routeId: string) => void;
}

export const VehicleAttentionPanel: React.FC<VehicleAttentionPanelProps> = ({
  attentionItems,
  onActionClick,
  onSelectVehicle,
  onSelectMaintenance,
  onSelectRoute,
}) => {
  if (!attentionItems || attentionItems.length === 0) return null;

  const handleItemClick = (item: VehicleAttentionItem) => {
    if (onActionClick) {
      onActionClick(item);
      return;
    }
    if (item.actionType === 'view_vehicle' && onSelectVehicle) {
      onSelectVehicle(item.vehicleId);
    } else if (item.actionType === 'view_maintenance' && onSelectMaintenance) {
      onSelectMaintenance(item.vehicleId);
    } else if (item.actionType === 'view_route' && onSelectRoute) {
      onSelectRoute(item.targetId || item.vehicleId);
    }
  };

  return (
    <div className="bg-white rounded-md border border-[#e5e7eb] shadow-xs p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider m-0">
          Requires Attention ({attentionItems.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {attentionItems.map((item) => {
          const isCritical = item.severity === 'critical';

          return (
            <div
              key={item.id}
              className={`p-2.5 rounded border text-xs flex items-center justify-between ${
                isCritical ? 'bg-red-50/70 border-red-200' : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-[#111827]">{item.vehicleId}</span>
                <span className="text-[#374151] font-medium">{item.issue}</span>
              </div>

              <button
                onClick={() => handleItemClick(item)}
                className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border ${
                  isCritical
                    ? 'bg-red-600 text-white border-red-700 hover:bg-red-700'
                    : 'bg-white text-[#374151] border-[#d1d5db] hover:bg-[#f9fafb]'
                }`}
              >
                {item.actionType === 'view_vehicle' && <Eye className="w-3 h-3" />}
                {item.actionType === 'view_maintenance' && <Wrench className="w-3 h-3 text-amber-600" />}
                {item.actionType === 'view_route' && <Route className="w-3 h-3 text-[#738a62]" />}
                <span>View</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VehicleAttentionPanel;
