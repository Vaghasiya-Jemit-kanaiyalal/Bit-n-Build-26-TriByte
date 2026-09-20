import React from 'react';
import type { BinStop } from '../../mock/routeData';
import { UnifiedGisMap } from '../common/UnifiedGisMap';

interface RouteMapProps {
  stops: BinStop[];
  onSelectBin?: (stop: BinStop) => void;
  selectedBinId?: string;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  onSelectBin,
  selectedBinId,
}) => {
  return (
    <div className="w-full h-full min-h-[460px]">
      <UnifiedGisMap
        zoneName="Central Collection Route"
        showRouteSelector={true}
        showAddRoute={true}
        selectedBinId={selectedBinId}
        onSelectBin={(wp) => {
          if (onSelectBin) {
            onSelectBin({
              id: wp.id,
              binId: wp.code,
              location: wp.label,
              zone: 'Central Route',
              fillLevel: wp.fillLevel,
              capacityLiters: 240,
              wasteType: wp.wasteType,
              priority: wp.fillLevel > 80 ? 'Critical' : 'Normal',
              status: (wp.status === 'COMPLETED' ? 'Completed' : wp.status === 'CURRENT' ? 'In Progress' : 'Pending') as any,
              eta: '10:15 AM',
              predictedOverflow: '~2 hours',
            });
          }
        }}
      />
    </div>
  );
};

export default RouteMap;
