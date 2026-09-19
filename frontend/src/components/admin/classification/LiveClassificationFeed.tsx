import React, { useState, useEffect, useRef } from 'react';
import type { ClassificationEvent, WasteType, ClassificationStatus } from '../../../types/classification';
import { Radio, Pause, Play, Eye, Filter } from 'lucide-react';

interface LiveClassificationFeedProps {
  initialEvents: ClassificationEvent[];
  onSelectEvent: (event: ClassificationEvent) => void;
}

export const LiveClassificationFeed: React.FC<LiveClassificationFeedProps> = ({
  initialEvents,
  onSelectEvent,
}) => {
  const [events, setEvents] = useState<ClassificationEvent[]>(initialEvents);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [wasteFilter, setWasteFilter] = useState<WasteType | 'ALL'>('ALL');
  const counterRef = useRef<number>(2843);

  // Live simulation effect (adds new item every 6 seconds)
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const num = counterRef.current++;
      const id = `CLS-0${num}`;
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      const wasteTypes: WasteType[] = ['PLASTIC', 'PAPER', 'METAL', 'GLASS', 'ORGANIC', 'OTHER'];
      const zones = ['Central Zone', 'North Zone', 'South Zone', 'East Zone', 'West Zone', 'Industrial Zone', 'Residential Zone'];
      const bins = ['BIN-C-104', 'BIN-N-201', 'BIN-R-305', 'BIN-I-402', 'BIN-S-112', 'BIN-E-208'];
      const sources: ClassificationEvent['source'][] = ['AI Vision', 'Bin Sensor', 'Hyperspectral Camera'];

      const isLowConf = Math.random() < 0.15;
      const isMixed = Math.random() < 0.1;

      const category = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
      const confidence = isLowConf ? Math.round(55 + Math.random() * 14) : Math.round(90 + Math.random() * 9.9);
      const weight = +(1.0 + Math.random() * 4.5).toFixed(1);

      let status: ClassificationStatus = 'CONFIRMED';
      if (isMixed) status = 'MIXED';
      else if (isLowConf) status = 'LOW_CONFIDENCE';

      const newEvent: ClassificationEvent = {
        id,
        timestamp: timeStr,
        date: 'Today',
        binId: bins[Math.floor(Math.random() * bins.length)],
        zone: zones[Math.floor(Math.random() * zones.length)],
        location: 'Live Stream Scan Site',
        detectedCategory: category,
        confidence,
        estimatedWeightKg: weight,
        source: sources[Math.floor(Math.random() * sources.length)],
        status,
        reviewStatus: status === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING',
        explanation: 'Real-time simulated inference stream update.',
        currentFill: `${Math.floor(40 + Math.random() * 55)}% Full`,
        lastCollection: 'Today 09:00 AM',
        predictedOverflow: '5 hours',
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 24)]);
    }, 6000);

    return () => clearInterval(interval);
  }, [isLive]);

  const filteredEvents = events.filter((e) => {
    if (wasteFilter !== 'ALL' && e.detectedCategory !== wasteFilter) return false;
    return true;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Live AI Classification Stream</h3>
          </div>

          {/* Live Indicator Badge */}
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              LIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300 uppercase tracking-wider">
              PAUSED
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Waste Type Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={wasteFilter}
              onChange={(e) => setWasteFilter(e.target.value as WasteType | 'ALL')}
              className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="PLASTIC">Plastic</option>
              <option value="PAPER">Paper</option>
              <option value="METAL">Metal</option>
              <option value="GLASS">Glass</option>
              <option value="ORGANIC">Organic</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Pause / Resume button */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border shadow-xs cursor-pointer ${
              isLive
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
            }`}
          >
            {isLive ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause Stream
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Resume Stream
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stream Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[750px]">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
              <th className="pb-3">Event ID</th>
              <th className="pb-3">Time</th>
              <th className="pb-3">Bin ID</th>
              <th className="pb-3">Zone</th>
              <th className="pb-3">Detected Category</th>
              <th className="pb-3 text-right">Confidence</th>
              <th className="pb-3 text-right">Est. Weight</th>
              <th className="pb-3">Source</th>
              <th className="pb-3 text-center">Status</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium font-mono">
            {filteredEvents.map((evt, index) => (
              <tr
                key={evt.id + index}
                onClick={() => onSelectEvent(evt)}
                className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                  index === 0 && isLive ? 'animate-in fade-in slide-in-from-top-1 bg-emerald-50/40' : ''
                }`}
              >
                <td className="py-2.5 font-bold text-slate-900">{evt.id}</td>
                <td className="py-2.5 text-slate-500">{evt.timestamp}</td>
                <td className="py-2.5 font-bold text-slate-800">{evt.binId}</td>
                <td className="py-2.5 text-slate-700 font-sans">{evt.zone}</td>
                <td className="py-2.5 font-sans">
                  <span
                    className={`inline-block font-bold px-2 py-0.5 rounded text-[11px] ${
                      evt.detectedCategory === 'PLASTIC'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : evt.detectedCategory === 'ORGANIC'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : evt.detectedCategory === 'PAPER'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : evt.detectedCategory === 'METAL'
                        ? 'bg-slate-100 text-slate-800 border border-slate-200'
                        : evt.detectedCategory === 'GLASS'
                        ? 'bg-purple-50 text-purple-800 border border-purple-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {evt.detectedCategory}
                  </span>
                </td>
                <td className="py-2.5 text-right font-bold text-slate-900">
                  <span
                    className={
                      evt.confidence >= 90
                        ? 'text-emerald-700 font-extrabold'
                        : evt.confidence >= 70
                        ? 'text-blue-700'
                        : 'text-red-600 font-extrabold'
                    }
                  >
                    {evt.confidence}%
                  </span>
                </td>
                <td className="py-2.5 text-right font-bold text-slate-800">{evt.estimatedWeightKg} kg</td>
                <td className="py-2.5 text-slate-600 font-sans">{evt.source}</td>
                <td className="py-2.5 text-center font-sans">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                      evt.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : evt.status === 'LOW_CONFIDENCE'
                        ? 'bg-red-100 text-red-800'
                        : evt.status === 'MIXED'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {evt.status}
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <button className="text-slate-400 hover:text-slate-900 p-1 rounded hover:bg-slate-200">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
