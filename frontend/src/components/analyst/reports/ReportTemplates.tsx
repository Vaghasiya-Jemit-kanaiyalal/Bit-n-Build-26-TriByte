import React from 'react';
import { Download } from 'lucide-react';
import type { ReportTemplateItem, ReportType } from '../../../services/reportsService';

interface ReportTemplatesProps {
  templates: ReportTemplateItem[];
  onSelectTemplate: (type: ReportType) => void;
}

export const ReportTemplates: React.FC<ReportTemplatesProps> = ({ templates, onSelectTemplate }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">Available Report Templates</h3>
        <span className="text-xs font-semibold text-slate-400">{templates.length} Ready Templates</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            onClick={() => onSelectTemplate(tpl.type)}
            className="bg-white border border-slate-200/80 hover:border-emerald-300 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                  {tpl.type}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">{tpl.defaultFormat}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">
                {tpl.name}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-4">{tpl.description}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400">
              <span className="text-[10px] font-medium">Est. {tpl.estimatedGenerationSec}s build</span>
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Generate <Download className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportTemplates;
