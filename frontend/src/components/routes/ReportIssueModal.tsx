import React, { useState } from 'react';
import { X, AlertCircle, Send } from 'lucide-react';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitIssue: (issueText: string) => void;
  routeId: string;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  onSubmitIssue,
  routeId,
}) => {
  const [issueType, setIssueType] = useState('Traffic Congestion');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitIssue(`${issueType}: ${description || 'Operational delay reported.'}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-[#e5e7eb] w-full max-w-md overflow-hidden flex flex-col text-xs text-[#374151]">
        
        {/* Header */}
        <div className="p-4 border-b border-[#e5e7eb] bg-red-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <h3 className="text-base font-bold text-red-950 m-0">Report Route Issue &bull; {routeId}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#111827] border-none bg-transparent cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-[#374151]">Issue Type</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-medium text-[#111827] focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="Traffic Congestion">Traffic Congestion / Road Block</option>
              <option value="Bin Damaged">Bin Sensor Fault / Damaged Bin</option>
              <option value="Vehicle Breakdown">Vehicle Mechanical Problem</option>
              <option value="Capacity Full">Vehicle Full Before Schedule</option>
              <option value="Access Denied">Access Blocked by Security</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-[#374151]">Detailed Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the obstacle or delay location..."
              className="w-full p-2.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-[#111827] focus:bg-white focus:outline-none focus:border-[#738a62]"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[#e5e7eb] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#4b5563] bg-white hover:bg-[#f3f4f6] border border-[#d1d5db] rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded border-none shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Dispatch Alert</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
