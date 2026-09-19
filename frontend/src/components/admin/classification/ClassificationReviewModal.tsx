import React, { useState, useEffect } from 'react';
import type { ClassificationEvent, WasteType } from '../../../types/classification';
import { X, CheckCircle2, AlertTriangle, Edit3 } from 'lucide-react';

interface ClassificationReviewModalProps {
  event: ClassificationEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmClassification: (id: string) => void;
  onSaveCorrection: (id: string, newCategory: WasteType, reason: string) => void;
}

export const ClassificationReviewModal: React.FC<ClassificationReviewModalProps> = ({
  event,
  isOpen,
  onClose,
  onConfirmClassification,
  onSaveCorrection,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<WasteType>('PLASTIC');
  const [correctionReason, setCorrectionReason] = useState('');

  useEffect(() => {
    if (event) {
      setSelectedCategory(event.detectedCategory);
      setCorrectionReason('');
    }
  }, [event, isOpen]);

  if (!isOpen || !event) return null;

  const wasteCategories: { value: WasteType; label: string }[] = [
    { value: 'PLASTIC', label: 'Plastic Material' },
    { value: 'PAPER', label: 'Paper & Cardboard' },
    { value: 'METAL', label: 'Metals & Cans' },
    { value: 'GLASS', label: 'Glass Bottles' },
    { value: 'ORGANIC', label: 'Organic & Food Waste' },
    { value: 'OTHER', label: 'Other / Non-Recyclable' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory === event.detectedCategory) {
      onConfirmClassification(event.id);
    } else {
      onSaveCorrection(event.id, selectedCategory, correctionReason);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Human Classification Review & Correction</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {/* AI Detection Summary */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 font-mono">
            <div className="flex justify-between items-center text-slate-500 text-[11px]">
              <span>ID: <strong>{event.id}</strong></span>
              <span>Bin: <strong>{event.binId}</strong> ({event.zone})</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200 font-sans">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">AI Primary Detection</span>
                <span className="text-base font-extrabold text-slate-900">{event.detectedCategory}</span>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-400 font-bold uppercase block font-sans">AI Confidence</span>
                <span className={`text-base font-extrabold ${event.confidence >= 70 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {event.confidence}%
                </span>
              </div>
            </div>
          </div>

          {/* Alternative Model Predictions */}
          {event.alternativePredictions && event.alternativePredictions.length > 0 && (
            <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200 space-y-1.5">
              <span className="font-bold text-blue-900 block text-xs">Alternative Model Probabilities:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                {event.alternativePredictions.map((alt) => (
                  <div key={alt.category} className="flex justify-between text-blue-900">
                    <span>{alt.category}:</span>
                    <span className="font-bold">{(alt.probability * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correct Category Selection */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">
              Select Correct Category <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as WasteType)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white font-semibold text-slate-900 focus:ring-1 focus:ring-slate-500 focus:outline-none"
            >
              {wasteCategories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label} {c.value === event.detectedCategory ? '(AI Original)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Correction Reason */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Correction Reason / Supervisor Notes (Optional)
            </label>
            <input
              type="text"
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              placeholder="e.g. Visual grease stain confused optical camera sensor"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:outline-none text-xs"
            />
          </div>

          {/* Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 text-amber-900 text-[11px]">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Saving a correction will override the AI classification result for this event and update recycling recovery metrics.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-sm flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {selectedCategory === event.detectedCategory ? 'Confirm AI Result' : 'Save Correction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
