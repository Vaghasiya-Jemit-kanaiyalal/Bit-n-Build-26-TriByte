import React from 'react';
import { Save, RotateCcw, AlertTriangle } from 'lucide-react';

interface SettingsHeaderProps {
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onReset: () => void;
  isSaving: boolean;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  hasUnsavedChanges,
  onSave,
  onReset,
  isSaving,
}) => {
  return (
    <div className="bg-white border-b border-[#e5e7eb] px-6 py-4 shadow-2xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Title & Breadcrumbs */}
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1">
            <span>ADMIN</span>
            <span>/</span>
            <span className="text-[#047857]">SETTINGS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
            Settings
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1 max-w-2xl leading-normal">
            Configure platform, operational, AI, alert, and account preferences.
          </p>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Unsaved Changes Indicator Badge */}
          {hasUnsavedChanges && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-xs font-bold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Unsaved Changes</span>
            </div>
          )}

          {/* Reset Button */}
          <button
            onClick={onReset}
            disabled={!hasUnsavedChanges || isSaving}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#d1d5db] text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Changes</span>
          </button>

          {/* Save Button */}
          <button
            onClick={onSave}
            disabled={!hasUnsavedChanges || isSaving}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-[#064e3b] hover:bg-[#047857] text-white text-xs font-bold rounded-lg shadow-2xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none"
          >
            {isSaving ? (
              <span className="inline-block animate-spin mr-1">🌀</span>
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>

        </div>

      </div>
    </div>
  );
};

export default SettingsHeader;
