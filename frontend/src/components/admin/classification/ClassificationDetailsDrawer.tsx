import React, { useEffect } from 'react';
import type { ClassificationEvent } from '../../../types/classification';
import { X, CheckCircle2, AlertTriangle, MapPin, Trash2, Cpu } from 'lucide-react';

interface ClassificationDetailsDrawerProps {
  event: ClassificationEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  onOpenReviewModal: (event: ClassificationEvent) => void;
  onNavigateToBins?: (binId: string) => void;
}

export const ClassificationDetailsDrawer: React.FC<ClassificationDetailsDrawerProps> = ({
  event,
  isOpen,
  onClose,
  onConfirm,
  onOpenReviewModal,
  onNavigateToBins,
}) => {
  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg md:max-w-xl bg-white rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 text-xs text-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
              {event.id}
            </span>
            <h2 className="text-sm font-bold text-slate-900">Classification Event Detail</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Main Hero Card */}
          <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Detected Material</span>
                <span className="text-xl font-extrabold text-white">{event.detectedCategory}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Confidence Score</span>
                <span
                  className={`text-xl font-extrabold font-mono ${
                    event.confidence >= 90 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {event.confidence}%
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>Est. Weight: <span className="font-bold text-white">{event.estimatedWeightKg} kg</span></div>
              <div>Source: <span className="font-bold text-blue-300">{event.source}</span></div>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-1">
            <span className="font-bold text-blue-900 block text-xs flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-blue-600" /> AI Inference Explanation:
            </span>
            <p className="text-[11px] text-blue-950 leading-relaxed font-sans">
              {event.explanation || event.reason || 'Visual characteristics strongly match plastic material polymer density.'}
            </p>
            <p className="text-[10px] text-slate-400 italic pt-1 border-t border-blue-100">
              * Explanation generated from demo classification data.
            </p>
          </div>

          {/* Location & Bin Context */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-slate-500" /> Bin & Network Telemetry
            </h4>

            <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">Bin ID:</span>
                <span className="font-bold text-slate-900">{event.binId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">Zone:</span>
                <span className="font-bold text-slate-900">{event.zone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">Current Fill:</span>
                <span className="font-bold text-amber-700">{event.currentFill || '82% Full'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">Predicted Overflow:</span>
                <span className="font-bold text-red-600">{event.predictedOverflow || '4 hours'}</span>
              </div>
            </div>
          </div>

          {/* Alternative Predictions List */}
          {event.alternativePredictions && event.alternativePredictions.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-100">
                Alternative Model Predictions
              </h4>
              <div className="space-y-1.5 font-mono text-xs">
                {event.alternativePredictions.map((alt) => (
                  <div key={alt.category} className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">{alt.category}</span>
                    <span className="text-slate-500">{(alt.probability * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onClose();
              if (onNavigateToBins) onNavigateToBins(event.binId);
            }}
            className="px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500" /> View Bin
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenReviewModal(event);
            }}
            className="px-3 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Send to Review
          </button>

          <button
            onClick={() => {
              onConfirm(event.id);
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
