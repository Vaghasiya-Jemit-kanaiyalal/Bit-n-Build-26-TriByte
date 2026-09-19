import React, { useState } from 'react';
import ReportsHeader from './ReportsHeader';
import ReportFilters from './ReportFilters';
import ReportTemplates from './ReportTemplates';
import RecentReportsTable from './RecentReportsTable';
import ReportPreviewModal from './ReportPreviewModal';
import {
  reportsService,
  type ReportType,
  type RecentReportItem,
  type GeneratedReportPreview,
} from '../../../services/reportsService';
import { showWebsiteToast } from '../../common/NotificationToast';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('Overall Analytics');
  const [dateRange, setDateRange] = useState<string>('Last 30 Days');
  const [selectedZone, setSelectedZone] = useState<string>('All Zones');

  const [templates] = useState(reportsService.getTemplates());
  const [recentReports, setRecentReports] = useState<RecentReportItem[]>(reportsService.getRecentReports());
  const [selectedReportForPreview, setSelectedReportForPreview] = useState<RecentReportItem | null>(null);
  const [previewData, setPreviewData] = useState<GeneratedReportPreview | null>(null);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const created = reportsService.generateReport(reportType, dateRange, selectedZone);
      setRecentReports([created, ...recentReports]);
      setIsGenerating(false);
      showWebsiteToast(`Generated ${reportType} package for ${dateRange}.`, 'success', 'Report Generated');
    }, 600);
  };

  const handleSelectTemplate = (type: ReportType) => {
    setReportType(type);
    showWebsiteToast(`Selected ${type} template for generation.`, 'info', 'Template Loaded');
  };

  const handlePreviewReport = (report: RecentReportItem) => {
    setSelectedReportForPreview(report);
    setPreviewData(reportsService.getPreview(report.id));
  };

  const handleDownloadReport = (report: RecentReportItem) => {
    const dummyContent = `Report ID: ${report.id}\nTitle: ${report.title}\nType: ${report.type}\nGenerated: ${report.createdAt}\nDate Range: ${report.dateRange}\nZone: ${report.zoneFilter}\n`;
    const mime = report.fileFormat === 'CSV' ? 'text/csv' : 'application/pdf';
    const blob = new Blob([dummyContent], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.title.replace(/\s+/g, '_')}.${report.fileFormat.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showWebsiteToast(`Downloaded ${report.title} (${report.fileFormat}).`, 'success', 'File Downloaded');
  };

  const handleDeleteReport = (reportId: string) => {
    setRecentReports(recentReports.filter((r) => r.id !== reportId));
    showWebsiteToast(`Archived report ${reportId} removed.`, 'info', 'Report Removed');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showWebsiteToast('Report archive and templates synced.', 'info', 'Archive Synced');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      <ReportsHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      <div className="max-w-7xl mx-auto px-6">
        <ReportFilters
          reportType={reportType}
          onReportTypeChange={setReportType}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedZone={selectedZone}
          onZoneChange={setSelectedZone}
          onGenerateReport={handleGenerateReport}
          isGenerating={isGenerating}
        />

        <ReportTemplates templates={templates} onSelectTemplate={handleSelectTemplate} />

        <RecentReportsTable
          reports={recentReports}
          onPreview={handlePreviewReport}
          onDownload={handleDownloadReport}
          onDelete={handleDeleteReport}
        />
      </div>

      {/* Report Preview Modal */}
      <ReportPreviewModal
        report={selectedReportForPreview}
        previewData={previewData}
        onClose={() => {
          setSelectedReportForPreview(null);
          setPreviewData(null);
        }}
        onDownload={handleDownloadReport}
      />
    </div>
  );
};

export default ReportsPage;
