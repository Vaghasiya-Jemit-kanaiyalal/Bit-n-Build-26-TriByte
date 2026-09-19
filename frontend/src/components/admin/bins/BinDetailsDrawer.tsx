import React from 'react';
import {
  X,
  Sparkles,
  MapPin,
  Clock,
  Cpu,
  Activity,
  Edit,
  Route as RouteIcon,
  History,
  Battery,
  Wifi,
  ExternalLink,
} from 'lucide-react';
import type { SmartBin } from '../../../types/bin';
import { BinFillIndicator } from './BinFillIndicator';

interface BinDetailsDrawerProps {
  bin: SmartBin | null;
  onClose: () => void;
  onEditBin: (bin: SmartBin) => void;
  onOpenMap: (bin: SmartBin) => void;
  onOpenHistory: (bin: SmartBin) => void;
  onAssignRoute?: (bin: SmartBin) => void;
}

export const BinDetailsDrawer: React.FC<BinDetailsDrawerProps> = ({
  bin,
  onClose,
  onEditBin,
  onOpenMap,
  onOpenHistory,
  onAssignRoute,
}) => {
  if (!bin) return null;

  const remainingVolumeLiters = Math.max(
    0,
    bin.capacityLiters - bin.currentFillLiters
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-slate-200 animate-slideLeft">
        
        {/* DRAWER HEADER */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/50 sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-lg font-extrabold text-slate-900">
                {bin.id}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  bin.status === 'Critical'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : bin.status === 'Warning'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-[#047857] border border-emerald-200'
                }`}
              >
                {bin.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium m-0">
              {bin.address} &bull; <strong className="text-slate-700">{bin.zone}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer border-none bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DRAWER BODY */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* SECTION 1: CURRENT STATUS */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              CURRENT STATUS
            </span>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Fill Level</span>
              <BinFillIndicator percent={bin.currentFillPercent} />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">Capacity</span>
                <span className="font-mono font-bold text-slate-900">{bin.capacityLiters} L</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">Remaining</span>
                <span className="font-mono font-bold text-slate-900">{remainingVolumeLiters} L</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">Waste Type</span>
                <span className="font-bold text-[#047857]">{bin.wasteType}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: AI PREDICTION */}
          <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#047857]" />
                <span className="text-xs font-extrabold text-[#064e3b] uppercase tracking-wider">
                  AI PREDICTION
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Confidence: {bin.prediction.predictionConfidence}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Predicted Fill in 2h:</span>
                <span className="font-mono font-extrabold text-slate-900 text-sm">
                  {bin.prediction.predictedFill2h}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Predicted Overflow:</span>
                <span className="font-mono font-extrabold text-red-600 text-sm">
                  {bin.prediction.overflowTimeText}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-600 font-medium">
                AI Overflow risk forecast model v2.4
              </span>
              <button
                onClick={() => alert('Navigating to Prediction Intelligence module...')}
                className="text-xs font-bold text-[#047857] hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent"
              >
                <span>View prediction details</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* SECTION 3: LOCATION & MINI-MAP */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>LOCATION TELEMETRY</span>
              </div>
              <button
                onClick={() => onOpenMap(bin)}
                className="text-xs font-bold text-[#047857] hover:underline cursor-pointer border-none bg-transparent"
              >
                Open on Map →
              </button>
            </div>

            <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 space-y-1 text-xs">
              <p className="font-semibold text-slate-900 m-0">{bin.address}</p>
              <p className="text-slate-500 text-[11px] m-0">{bin.zone}</p>
              <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-600">
                <span>Lat: {bin.latitude.toFixed(4)}</span>
                <span>Lng: {bin.longitude.toFixed(4)}</span>
              </div>
            </div>

            {/* Visual Mini-Map Graphic */}
            <div className="relative h-28 w-full rounded-xl bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-60"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400&auto=format&fit=crop')`,
                }}
              />
              <div className="absolute p-2 bg-red-600 text-white rounded-full shadow-lg border-2 border-white animate-bounce">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="absolute bottom-2 left-2 bg-white/90 text-slate-900 text-[9px] font-bold px-2 py-0.5 rounded shadow">
                {bin.id} Location Pin
              </span>
            </div>
          </div>

          {/* SECTION 4: COLLECTION DETAILS */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>COLLECTION SCHEDULE</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-600">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Last Collection</span>
                <span className="font-semibold text-slate-900">{bin.lastCollectionAt}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Next Scheduled</span>
                <span className="font-semibold text-slate-900">{bin.nextScheduledAt || 'TBD'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Assigned Route</span>
                <span className="font-mono font-bold text-blue-700">{bin.assignedRouteId || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Status</span>
                <span className="font-bold text-slate-900">{bin.collectionStatus}</span>
              </div>
            </div>
          </div>

          {/* SECTION 5: DEVICE / SENSOR TELEMETRY */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>SENSOR & TELEMETRY</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Sensor ID</span>
                <span className="font-mono font-bold text-slate-900">{bin.sensor.sensorId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Battery Level</span>
                <span className="font-mono font-bold text-emerald-700 flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5" />
                  {bin.sensor.batteryLevel}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Connectivity</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-blue-600" />
                  {bin.sensor.connectivity}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Last Sensor Update</span>
                <span className="font-medium text-slate-700">{bin.sensor.lastUpdate}</span>
              </div>
            </div>
          </div>

          {/* SECTION 6: RECENT ACTIVITY */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
              <Activity className="w-4 h-4 text-slate-600" />
              <span>RECENT BIN ACTIVITY</span>
            </div>

            <div className="space-y-2">
              {(bin.activity || [
                { id: '1', timestamp: 'Today 08:14', message: 'Fill level increased to 92%', type: 'fill_update' },
                { id: '2', timestamp: 'Today 07:58', message: 'Fill level increased to 88%', type: 'fill_update' },
                { id: '3', timestamp: 'Today 06:42', message: 'Bin collected', type: 'collection' },
              ]).map((act: { id: string; timestamp: string; message: string }) => (
                <div key={act.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                  <span className="font-medium text-slate-700">{act.message}</span>
                  <span className="text-[10px] font-mono text-slate-400">{act.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* DRAWER FOOTER ACTIONS */}
        <div className="p-4 border-t border-slate-200 bg-white sticky bottom-0 flex items-center gap-2">
          <button
            onClick={() => onEditBin(bin)}
            className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border-none"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Bin</span>
          </button>

          <button
            onClick={() => onOpenHistory(bin)}
            className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border-none"
          >
            <History className="w-3.5 h-3.5" />
            <span>View History</span>
          </button>

          {onAssignRoute && (
            <button
              onClick={() => onAssignRoute(bin)}
              className="flex-1 px-3 py-2 bg-[#064e3b] text-white hover:bg-[#047857] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border-none"
            >
              <RouteIcon className="w-3.5 h-3.5" />
              <span>Assign Route</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
