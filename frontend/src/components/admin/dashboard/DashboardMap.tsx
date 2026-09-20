import React from 'react';
import type {
  DashboardMapBinMarker,
  DashboardMapVehicleMarker,
  DashboardMapRoutePolyline,
} from '../../../types/dashboard';
import { UnifiedGisMap } from '../../common/UnifiedGisMap';

interface DashboardMapProps {
  bins: DashboardMapBinMarker[];
  vehicles: DashboardMapVehicleMarker[];
  routes: DashboardMapRoutePolyline[];
  onSelectBin: (bin: DashboardMapBinMarker) => void;
  onSelectVehicle: (vehicle: DashboardMapVehicleMarker) => void;
  onSelectRoute: (route: DashboardMapRoutePolyline) => void;
}

export const DashboardMap: React.FC<DashboardMapProps> = ({
  onSelectBin,
  onSelectVehicle,
}) => {
  return (
    <div className="w-full h-full min-h-[460px]">
      <UnifiedGisMap
        zoneName="Vadodara Central Hub"
        stepIntervalMs={60000}
        onSelectBin={(wp) => {
          if (onSelectBin) {
            onSelectBin({
              id: wp.id,
              binCode: wp.code,
              location: wp.label,
              zone: 'Central Hub',
              fillLevel: wp.fillLevel,
              status: (wp.fillLevel > 80 ? 'CRITICAL' : wp.fillLevel > 60 ? 'WARNING' : 'NORMAL') as any,
              wasteType: wp.wasteType,
              timeToOverflow: '~2 hours',
              coordinates: { x: wp.x, y: wp.y },
            });
          }
        }}
        onSelectVehicle={(route) => {
          if (onSelectVehicle) {
            onSelectVehicle({
              id: route.vehicleId,
              vehicleCode: route.vehicleId,
              driverName: route.driverName || 'Driver',
              currentRoute: route.code,
              status: 'EN_ROUTE' as any,
              loadPercentage: 45,
              currentSpeedKmH: 22,
              fuelPercent: 88,
              coordinates: { x: 500, y: 300 },
            } as any);
          }
        }}
      />
    </div>
  );
};

export default DashboardMap;
