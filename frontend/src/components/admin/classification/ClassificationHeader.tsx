import React, { useRef } from 'react';
import { Calendar, Filter, RefreshCw, Download, Sparkles, Upload } from 'lucide-react';
import type { DateRangeOption, WasteType } from '../../../types/classification';

interface ClassificationHeaderProps {
  dateRange: DateRangeOption;
  selectedZone: string;
  selectedWasteType: WasteType | 'ALL';
  onDateRangeChange: (range: DateRangeOption) => void;
  onZoneChange: (zone: string) => void;
  onWasteTypeChange: (type: WasteType | 'ALL') => void;
  onRefresh: () => void;
  onExport: (type: 'all' | 'composition' | 'review' | 'zone') => void;
  onUploadImage?: (file: File) => void;
}

export const ClassificationHeader: React.FC<ClassificationHeaderProps> = ({
  dateRange,
  selectedZone,
  selectedWasteType,
  onDateRangeChange,
  onZoneChange,
  onWasteTypeChange,
  onRefresh,
  onExport,
  onUploadImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadImage) {
      onUploadImage(file);
    }
  };

  const dateOptions: DateRangeOption[] = [
    'Today',
    'Last 7 Days',
    'Last 30 Days',
    'Last 90 Days',
    'Custom Range',
  ];

  const zoneOptions = [
    'ALL',
    'Central Zone',
    'North Zone',
    'South Zone',
    'East Zone',
    'West Zone',
    'Industrial Zone',
    'Residential Zone',
  ];

  const wasteTypeOptions: { value: WasteType | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All Waste Types' },
    { value: 'PLASTIC', label: 'Plastic' },
    { value: 'PAPER', label: 'Paper' },
    { value: 'METAL', label: 'Metal' },
    { value: 'GLASS', label: 'Glass' },
    { value: 'ORGANIC', label: 'Organic' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-1">
          <span>ADMIN</span>
          <span>/</span>
          <span className="text-[#047857] flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> CLASSIFICATION
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          Waste Classification & Material Intelligence
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-2xl leading-relaxed">
          Monitor AI-based waste classification, upload waste photos for instant inference, and review material composition.
        </p>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {/* Upload Image Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Waste Photo</span>
        </button>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value as DateRangeOption)}
            className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
          >
            {dateOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Zone Selector */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedZone}
            onChange={(e) => onZoneChange(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
          >
            {zoneOptions.map((z) => (
              <option key={z} value={z}>
                {z === 'ALL' ? 'Zone: All Zones' : z}
              </option>
            ))}
          </select>
        </div>

        {/* Waste Type Selector */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-xs">
          <select
            value={selectedWasteType}
            onChange={(e) => onWasteTypeChange(e.target.value as WasteType | 'ALL')}
            className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
          >
            {wasteTypeOptions.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-xs cursor-pointer"
          title="Refresh classification data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Export Button */}
        <div className="relative group">
          <button
            onClick={() => onExport('all')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};

