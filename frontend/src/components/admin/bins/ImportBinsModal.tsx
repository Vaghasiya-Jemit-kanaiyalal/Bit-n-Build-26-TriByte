import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Download, CheckCircle } from 'lucide-react';

interface ImportBinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const ImportBinsModal: React.FC<ImportBinsModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImportSubmit = () => {
    if (!selectedFile) return;
    setIsImporting(true);

    setTimeout(() => {
      setIsImporting(false);
      setSuccessMsg(`Successfully imported ${selectedFile.name} (18 smart bins processed).`);
      setTimeout(() => {
        onImportComplete();
        onClose();
        setSuccessMsg('');
        setSelectedFile(null);
      }, 1200);
    }, 1000);
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Bin ID,Name,Capacity,Waste Type,Zone,Address,Latitude,Longitude,Sensor ID\nBIN-9001,Sample Bin,1100,Organic,Central Zone,Central Market Gate,22.3072,73.1812,SNS-9001';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'smart_bin_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp">
        {/* HEADER */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 m-0">Import Smart Bins</h3>
            <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
              Bulk upload bin records using CSV format.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 cursor-pointer border-none bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          {successMsg ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 text-[#047857]">
              <CheckCircle className="w-8 h-8 mx-auto" />
              <p className="text-xs font-bold">{successMsg}</p>
            </div>
          ) : (
            <>
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                  dragActive ? 'border-[#047857] bg-emerald-50/50' : 'border-slate-300 bg-slate-50/60 hover:bg-slate-100/60'
                }`}
              >
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-file-upload"
                />

                <label htmlFor="csv-file-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#047857] flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {selectedFile ? selectedFile.name : 'Click to upload or drag & drop CSV'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                      : 'Supported formats: .CSV, .XLSX (Max 10MB)'}
                  </span>
                </label>
              </div>

              {/* Template Download Button */}
              <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Download Sample CSV Template</span>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="text-xs font-bold text-[#047857] hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Template</span>
                </button>
              </div>
            </>
          )}

          {/* FOOTER ACTIONS */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer border-none"
            >
              Cancel
            </button>
            <button
              onClick={handleImportSubmit}
              disabled={!selectedFile || isImporting}
              className="px-5 py-2 bg-[#064e3b] text-white hover:bg-[#047857] rounded-xl text-xs font-bold shadow-md cursor-pointer border-none flex items-center gap-1.5 disabled:opacity-40"
            >
              <Upload className="w-4 h-4" />
              <span>{isImporting ? 'Processing CSV...' : 'Import Bins'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
