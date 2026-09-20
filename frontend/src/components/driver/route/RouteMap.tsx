import React from 'react';
import type { DriverRouteStop, RouteStatus } from '../../../types/driver';
import UnifiedGisMap from '../../common/UnifiedGisMap';

interface RouteMapProps {
  stops?: DriverRouteStop[];
  routeStatus?: RouteStatus;
  selectedStopId?: string;
  onSelectStop?: (stop: DriverRouteStop) => void;
  driverId?: 'driver-1' | 'driver-2' | string;
  onOperationPerform?: (action: 'MARK_COLLECTED' | 'SKIP_STOP') => void;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  selectedStopId,
  onSelectStop,
  driverId = 'driver-1',
  onOperationPerform,
}) => {
  return (
    <UnifiedGisMap
      mode="driver"
      driverId={driverId}
      zoneName={driverId === 'driver-2' ? 'Zone 3 (Sayajigunj Hub)' : 'Zone 1 (DEPSTAR Campus)'}
      speedKmH={22}
      selectedBinId={selectedStopId}
      onSelectBin={(bin) => onSelectStop && onSelectStop(bin)}
      defaultPointIndex={1} // Point 2 default
      onOperationPerform={onOperationPerform}
    />
  );
};

export default RouteMap;
