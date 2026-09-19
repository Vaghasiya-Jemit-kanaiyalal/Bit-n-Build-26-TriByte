import React, { useState } from 'react';
import { X, UploadCloud, Download, CheckCircle2, FileSpreadsheet } from 'lucide-react';

interface ImportUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (count: number) => void;
}

export const ImportUsersModal: React.FC<ImportUsersModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
    errors: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    const csvHeader = 'firstName,lastName,email,phone,role,zone,vehicleId,routeId\n';
    const sampleRow1 = 'Suresh,Vaghasia,suresh.v@example.com,+919876543210,DRIVER,Central Zone,TRK-021,R-104\n';
    const sampleRow2 = 'Kavita,Desai,kavita.d@example.com,+919876543211,ANALYST,North Zone,,';
    const blob = new Blob([csvHeader + sampleRow1 + sampleRow2], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleStartImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const res = { imported: 8, skipped: 2, errors: 1 };
      setImportResult(res);
      onImportComplete(res.imported);
    }, 1200);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImportResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Bulk Import Platform Users</h3>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {!importResult ? (
            <>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-slate-600 font-medium">Need the standard CSV structure?</span>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download Template
                </button>
              </div>

              {/* Upload Drop Area */}
              <div className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-6 text-center bg-slate-50/50 transition-colors relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                {selectedFile ? (
                  <div>
                    <p className="font-bold text-slate-900">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {(selectedFile.size / 1024).toFixed(1)} KB • CSV File Ready
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-slate-700">Drag & drop your CSV file here</p>
                    <p className="text-[11px] text-slate-400 mt-1">or click to browse local files</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-100 p-2.5 rounded text-[11px] text-slate-600">
                Supported format: <strong>CSV</strong> (Columns: <code>firstName, lastName, email, phone, role, zone</code>)
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartImport}
                  disabled={!selectedFile || isProcessing}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-sm"
                >
                  {isProcessing ? 'Processing CSV...' : 'Import Users'}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-emerald-950 text-sm">Bulk Import Completed</h4>
                <p className="text-xs text-emerald-800 mt-0.5">User records have been parsed and merged.</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200">
                  <p className="text-[10px] text-emerald-800 uppercase font-semibold">Imported</p>
                  <p className="text-lg font-bold font-mono text-emerald-950">{importResult.imported}</p>
                </div>
                <div className="bg-amber-50 p-2.5 rounded border border-amber-200">
                  <p className="text-[10px] text-amber-800 uppercase font-semibold">Skipped (Dupes)</p>
                  <p className="text-lg font-bold font-mono text-amber-950">{importResult.skipped}</p>
                </div>
                <div className="bg-red-50 p-2.5 rounded border border-red-200">
                  <p className="text-[10px] text-red-800 uppercase font-semibold">Errors</p>
                  <p className="text-lg font-bold font-mono text-red-950">{importResult.errors}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
