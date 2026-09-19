import React, { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import type { LowConfidencePrediction } from '../../../types/prediction';

interface PredictionReviewDrawerProps {
  prediction: LowConfidencePrediction | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
}

export const PredictionReviewDrawer: React.FC<PredictionReviewDrawerProps> = ({
  prediction,
  isOpen,
  onClose,
  onAccept,
  onDismiss,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !prediction) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 text-xs text-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-slate-900">Review Prediction {prediction.id}</span>
              <span className="text-xs text-slate-500 font-medium">{prediction.binCode} &bull; {prediction.zone} Zone</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer border-none bg-transparent"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 flex-1">
          {/* Confidence Badge & Reason */}
          <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">Low Confidence Warning</span>
              <span className="text-xs font-mono font-extrabold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                {prediction.confidence}% Confidence
              </span>
            </div>
            <p className="text-xs text-amber-900 font-bold mt-1">Reason: {prediction.reason}</p>
          </div>

          {/* Forecast Comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Model Forecast</span>
              <span className="text-xl font-mono font-extrabold text-amber-700 block mt-1">{prediction.predictedFill}%</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Alternative Adjusted</span>
              <span className="text-xl font-mono font-extrabold text-emerald-700 block mt-1">{prediction.alternativeForecast}%</span>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <span className="text-xs font-bold text-slate-900 block">Prediction Diagnostics</span>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">{prediction.predictionExplanation}</p>
          </div>

          {/* Recommended Action */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1.5">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Recommended Operator Action</span>
            </span>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">{prediction.recommendedAction}</p>
          </div>

          <div className="text-xs font-medium text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Historical Availability:</span>
              <span className="font-bold text-slate-800">{prediction.historicalDataAvailability}</span>
            </div>
            <div className="flex justify-between">
              <span>Flagged Date:</span>
              <span className="font-mono text-slate-800">{prediction.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onDismiss(prediction.id);
              onClose();
            }}
            className="py-2.5 bg-white text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-4 h-4 text-slate-400" />
            <span>Dismiss</span>
          </button>
          <button
            onClick={() => {
              onAccept(prediction.id);
              onClose();
            }}
            className="py-2.5 bg-[#064e3b] text-white hover:bg-[#047857] rounded-xl text-xs font-bold shadow-sm cursor-pointer border-none flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Accept Prediction</span>
          </button>
        </div>
      </div>
    </div>
  );
};
