import React, { useState, useEffect } from 'react';
import { X, Zap, CheckCircle2, Loader2 } from 'lucide-react';

interface GeneratePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated: () => void;
  totalBins: number;
  totalWasteTons: string;
  selectedVehiclesCount: number;
  selectedDriversCount: number;
  horizon: string;
  strategy: string;
}

const STEPS = [
  'Analyzing demand...',
  'Checking bin priorities...',
  'Checking vehicle capacity...',
  'Checking driver availability...',
  'Applying constraints...',
  'Optimizing collection plan...',
  'Preparing routes...',
];

export const GeneratePlanModal: React.FC<GeneratePlanModalProps> = ({
  isOpen,
  onClose,
  onPlanGenerated,
  totalBins,
  totalWasteTons,
  selectedVehiclesCount,
  selectedDriversCount,
  horizon,
  strategy,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setIsGenerating(false);
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  const handleStartGeneration = () => {
    setIsGenerating(true);
    setCurrentStepIndex(0);
  };

  useEffect(() => {
    if (!isGenerating) return;

    if (currentStepIndex < STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // Finished all steps
      const finishTimer = setTimeout(() => {
        setIsGenerating(false);
        onPlanGenerated();
      }, 400);
      return () => clearTimeout(finishTimer);
    }
  }, [isGenerating, currentStepIndex, onPlanGenerated]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Generate Collection Plan</h3>
          </div>
          {!isGenerating && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        {!isGenerating ? (
          <div className="p-6 space-y-6">
            <p className="text-xs text-slate-600">
              Generate an optimized multi-route collection schedule based on configured AI weights, bin fill projections, vehicle limits, and driver rosters.
            </p>

            {/* Summary Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <div>
                <span className="text-slate-400 block font-medium">Selected Bins</span>
                <span className="font-bold font-mono text-slate-900 text-base">{totalBins}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Expected Waste</span>
                <span className="font-bold font-mono text-emerald-700 text-base">{totalWasteTons} t</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Allocated Vehicles</span>
                <span className="font-bold font-mono text-slate-900 text-base">{selectedVehiclesCount}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Available Drivers</span>
                <span className="font-bold font-mono text-slate-900 text-base">{selectedDriversCount}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Planning Window</span>
                <span className="font-semibold text-slate-800">{horizon}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Optimization Strategy</span>
                <span className="font-semibold text-emerald-800">{strategy}</span>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleStartGeneration}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition flex items-center space-x-2"
              >
                <Zap className="w-4 h-4 text-white" />
                <span>Generate Plan</span>
              </button>
            </div>
          </div>
        ) : (
          /* Simulated Calculation Progress */
          <div className="p-8 space-y-6 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-6 h-6 text-emerald-700 animate-spin" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Optimizing Collection Plan</h4>
              <p className="text-xs text-slate-500 font-mono">Running operational route solver algorithm...</p>
            </div>

            {/* Step list */}
            <div className="space-y-2 text-left bg-slate-50 p-4 border border-slate-200 rounded-xl text-xs">
              {STEPS.map((stepText, idx) => {
                const isDone = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={stepText} className="flex items-center space-x-2">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span className={isDone ? 'text-slate-800 font-medium' : isCurrent ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                      {stepText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
