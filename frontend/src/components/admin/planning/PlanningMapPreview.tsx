import React from 'react';
import { UnifiedGisMap } from '../../common/UnifiedGisMap';

export const PlanningMapPreview: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[480px]">
      <UnifiedGisMap
        zoneName="Operational Planning Sector"
        stepIntervalMs={60000}
      />
    </div>
  );
};

export default PlanningMapPreview;
