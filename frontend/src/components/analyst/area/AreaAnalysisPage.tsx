import React, { useState } from 'react';
import AreaAnalysisHeader from './AreaAnalysisHeader';
import AreaAnalysisKpis from './AreaAnalysisKpis';
import ZoneComparisonChart from './ZoneComparisonChart';
import ZonePerformanceTable from './ZonePerformanceTable';
import ZoneDetailsDrawer from './ZoneDetailsDrawer';
import AreaInsights from './AreaInsights';
import { areaAnalysisService, type ZoneItem } from '../../../services/areaAnalysisService';
import { showWebsiteToast } from '../../common/NotificationToast';

export const AreaAnalysisPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>('Last 30 Days');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('All');
  const [selectedDrawerZone, setSelectedDrawerZone] = useState<ZoneItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const kpis = areaAnalysisService.getKpis(selectedZoneFilter, dateRange);
  const zoneList = areaAnalysisService.getZoneList();
  const insights = areaAnalysisService.getInsights();

  const filteredZones =
    selectedZoneFilter === 'All'
      ? zoneList
      : zoneList.filter((z) => z.name === selectedZoneFilter);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showWebsiteToast(`Area analysis telemetry synced for ${selectedZoneFilter} Zone.`, 'info', 'Telemetry Synced');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      <AreaAnalysisHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedZone={selectedZoneFilter}
        onZoneChange={setSelectedZoneFilter}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="max-w-7xl mx-auto px-6">
        <AreaAnalysisKpis kpis={kpis} />

        <ZoneComparisonChart zones={filteredZones} onSelectZone={(z) => setSelectedDrawerZone(z)} />

        <ZonePerformanceTable zones={filteredZones} onSelectZone={(z) => setSelectedDrawerZone(z)} />

        <AreaInsights insights={insights} />
      </div>

      {/* Zone Details Drawer */}
      <ZoneDetailsDrawer zone={selectedDrawerZone} onClose={() => setSelectedDrawerZone(null)} />
    </div>
  );
};

export default AreaAnalysisPage;
