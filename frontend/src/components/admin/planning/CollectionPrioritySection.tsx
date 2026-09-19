import React, { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import type { PriorityBin } from '../../../types/planning';

interface CollectionPrioritySectionProps {
  bins: PriorityBin[];
  onSelectBin: (bin: PriorityBin) => void;
  onToggleSelectBinForPlan: (binId: string) => void;
  onBulkAddToPlan: (binIds: string[]) => void;
}

export const CollectionPrioritySection: React.FC<CollectionPrioritySectionProps> = ({
  bins,
  onSelectBin,
  onToggleSelectBinForPlan,
  onBulkAddToPlan,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [wasteTypeFilter, setWasteTypeFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'score' | 'time' | 'fill' | 'waste'>('score');
  const [selectedBinIds, setSelectedBinIds] = useState<string[]>([]);

  // Filter & Sort
  const filteredBins = useMemo(() => {
    return bins
      .filter((bin) => {
        const reasonStr = bin.priorityReason || bin.reason || '';
        const categoryStr = bin.priorityCategory || 'Medium';
        const matchesSearch =
          bin.binId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bin.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reasonStr.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority =
          priorityFilter === 'All' || categoryStr === priorityFilter;
        const matchesZone = zoneFilter === 'All' || bin.zone === zoneFilter;
        const matchesWaste =
          wasteTypeFilter === 'All' || bin.wasteType.toLowerCase() === wasteTypeFilter.toLowerCase();
        return matchesSearch && matchesPriority && matchesZone && matchesWaste;
      })
      .sort((a, b) => {
        const fillA = a.fillLevelPct ?? a.fillLevel ?? 0;
        const fillB = b.fillLevelPct ?? b.fillLevel ?? 0;
        const wasteA = a.estimatedWasteKg ?? ((a.estimatedWasteTons ?? 0) * 1000);
        const wasteB = b.estimatedWasteKg ?? ((b.estimatedWasteTons ?? 0) * 1000);

        if (sortBy === 'score') return b.priorityScore - a.priorityScore;
        if (sortBy === 'time') return a.timeToOverflowHours - b.timeToOverflowHours;
        if (sortBy === 'fill') return fillB - fillA;
        if (sortBy === 'waste') return wasteB - wasteA;
        return 0;
      });
  }, [bins, searchTerm, priorityFilter, zoneFilter, wasteTypeFilter, sortBy]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBinIds(filteredBins.map((b) => b.binId));
    } else {
      setSelectedBinIds([]);
    }
  };

  const handleToggleCheckbox = (binId: string) => {
    setSelectedBinIds((prev) =>
      prev.includes(binId) ? prev.filter((id) => id !== binId) : [...prev, binId]
    );
  };

  const handleBulkAdd = () => {
    onBulkAddToPlan(selectedBinIds);
    setSelectedBinIds([]);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Section Header */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold tracking-tight text-white">Collection Priority</h3>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Simulated AI Priority
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Review bins ranked by operational urgency before generating the collection plan.
            </p>
          </div>

          {selectedBinIds.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkAdd}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Selected ({selectedBinIds.length}) to Plan</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Bin ID, Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800/90 text-white border border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-slate-400"
            />
          </div>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-800/90 text-white border border-slate-700 rounded-lg text-xs px-3 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="All">Priority: All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Zone */}
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="bg-slate-800/90 text-white border border-slate-700 rounded-lg text-xs px-3 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="All">Zone: All</option>
            <option value="Central">Central</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="Industrial">Industrial</option>
            <option value="Residential">Residential</option>
          </select>

          {/* Waste Type */}
          <select
            value={wasteTypeFilter}
            onChange={(e) => setWasteTypeFilter(e.target.value)}
            className="bg-slate-800/90 text-white border border-slate-700 rounded-lg text-xs px-3 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="All">Waste Type: All</option>
            <option value="general">General</option>
            <option value="recyclable">Recyclable</option>
            <option value="organic">Organic</option>
            <option value="hazardous">Hazardous</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-800/90 text-white border border-slate-700 rounded-lg text-xs px-3 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="score">Sort: Highest Priority</option>
            <option value="time">Sort: Earliest Overflow</option>
            <option value="fill">Sort: Highest Fill %</option>
            <option value="waste">Sort: Largest Waste Output</option>
          </select>

        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedBinIds.length === filteredBins.length && filteredBins.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Bin ID</th>
              <th className="py-3 px-4">Zone</th>
              <th className="py-3 px-4">Fill Level</th>
              <th className="py-3 px-4">Predicted Fill</th>
              <th className="py-3 px-4">Estimated Waste</th>
              <th className="py-3 px-4">Time to Overflow</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {filteredBins.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500 font-medium">
                  No priority bins match the current filters.
                </td>
              </tr>
            ) : (
              filteredBins.map((bin) => {
                const fill = bin.fillLevelPct ?? bin.fillLevel ?? 0;
                const predFill = bin.predictedFillPct ?? bin.predictedFill ?? 0;
                const wasteKg = bin.estimatedWasteKg ?? ((bin.estimatedWasteTons ?? 0) * 1000);
                const category = bin.priorityCategory || 'Medium';
                const reason = bin.priorityReason || bin.reason || 'High fill level';
                const isSelected = bin.isSelectedForPlan ?? bin.isSelected;

                return (
                  <tr
                    key={bin.binId}
                    className={`hover:bg-slate-50/80 transition cursor-pointer ${
                      isSelected ? 'bg-emerald-50/30' : ''
                    }`}
                    onClick={() => onSelectBin(bin)}
                  >
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedBinIds.includes(bin.binId)}
                        onChange={() => handleToggleCheckbox(bin.binId)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>

                    {/* Priority Score badge */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold font-mono text-slate-900 text-sm">{bin.priorityScore}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          category === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                          category === 'High' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {category}
                        </span>
                      </div>
                    </td>

                    {/* Bin ID & Type */}
                    <td className="py-3 px-4 font-bold font-mono text-emerald-800">
                      {bin.binId}
                    </td>

                    {/* Zone */}
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {bin.zone}
                    </td>

                    {/* Current Fill */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${fill >= 85 ? 'bg-red-500' : fill >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${fill}%` }}
                          />
                        </div>
                        <span className="font-mono font-semibold text-slate-900">{fill}%</span>
                      </div>
                    </td>

                    {/* Predicted Fill */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {predFill}%
                    </td>

                    {/* Estimated Waste */}
                    <td className="py-3 px-4 font-mono text-slate-900">
                      {wasteKg} kg
                    </td>

                    {/* Time to Overflow */}
                    <td className="py-3 px-4 font-mono font-bold text-red-600">
                      {bin.timeToOverflowHours}h
                    </td>

                    {/* Reason */}
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {reason}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onToggleSelectBinForPlan(bin.binId)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200'
                        }`}
                      >
                        {isSelected ? 'Remove' : 'Add to Plan'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
