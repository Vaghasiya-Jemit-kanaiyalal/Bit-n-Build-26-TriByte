import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { SmartBin, WasteType, BinType, ZoneName, CollectionPriority, BinStatus } from '../../../types/bin';

interface AddEditBinModalProps {
  isOpen: boolean;
  binToEdit?: SmartBin | null;
  onClose: () => void;
  onSubmit: (data: Partial<SmartBin>) => Promise<void>;
}

export const AddEditBinModal: React.FC<AddEditBinModalProps> = ({
  isOpen,
  binToEdit,
  onClose,
  onSubmit,
}) => {
  const isEditing = !!binToEdit;

  const [formData, setFormData] = useState<Partial<SmartBin>>({
    id: '',
    name: '',
    type: 'Smart Bin',
    capacityLiters: 1100,
    currentFillPercent: 0,
    wasteType: 'Mixed',
    zone: 'Central Zone',
    address: '',
    latitude: 22.3072,
    longitude: 73.1812,
    sensor: {
      sensorId: '',
      batteryLevel: 100,
      connectivity: 'Online',
      lastUpdate: 'Just now',
      signalStrength: 'Strong',
    },
    collectionPriority: 'Medium',
    status: 'Normal',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (binToEdit) {
      setFormData({ ...binToEdit });
    } else {
      const autoId = `BIN-${Math.floor(1000 + Math.random() * 9000)}`;
      setFormData({
        id: autoId,
        code: autoId,
        name: '',
        type: 'Smart Bin',
        capacityLiters: 1100,
        currentFillPercent: 0,
        wasteType: 'Mixed',
        zone: 'Central Zone',
        address: '',
        latitude: 22.3072,
        longitude: 73.1812,
        sensor: {
          sensorId: `SNS-${autoId.replace('BIN-', '')}`,
          batteryLevel: 100,
          connectivity: 'Online',
          lastUpdate: 'Just now',
          signalStrength: 'Strong',
        },
        collectionPriority: 'Medium',
        status: 'Normal',
      });
    }
    setErrors({});
  }, [binToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.id?.trim()) errs.id = 'Bin ID is required';
    if (!formData.address?.trim()) errs.address = 'Address location is required';
    if (!formData.sensor?.sensorId?.trim()) errs.sensorId = 'Sensor ID is required';
    if (!formData.capacityLiters || formData.capacityLiters <= 0) errs.capacityLiters = 'Capacity must be positive';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to save bin information' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp">
        
        {/* HEADER */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 m-0">
              {isEditing ? `Edit Bin ${binToEdit.id}` : 'Add New Smart Bin'}
            </h2>
            <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
              {isEditing
                ? 'Update operational details, location, and sensor information.'
                : 'Register a new smart bin unit into the operational monitoring network.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 cursor-pointer border-none bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
              {errors.submit}
            </div>
          )}

          {/* BASIC INFORMATION */}
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              1. BASIC INFORMATION
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bin ID *</label>
                <input
                  type="text"
                  disabled={isEditing}
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono font-bold ${
                    errors.id ? 'border-red-500' : 'border-slate-200'
                  } disabled:opacity-60`}
                  placeholder="BIN-1087"
                />
                {errors.id && <span className="text-[10px] text-red-600 font-semibold">{errors.id}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bin Name (Optional)</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  placeholder="e.g. Central Market Main Bin"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bin Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as BinType })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Smart Bin">Smart Bin</option>
                  <option value="Standard Bin">Standard Bin</option>
                  <option value="Recycling Bin">Recycling Bin</option>
                  <option value="Organic Bin">Organic Bin</option>
                  <option value="Mixed Waste Bin">Mixed Waste Bin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Capacity (Liters) *</label>
                <input
                  type="number"
                  value={formData.capacityLiters}
                  onChange={(e) => setFormData({ ...formData, capacityLiters: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Waste Type *</label>
                <select
                  value={formData.wasteType}
                  onChange={(e) => setFormData({ ...formData, wasteType: e.target.value as WasteType })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Mixed">Mixed</option>
                  <option value="Organic">Organic</option>
                  <option value="Plastic">Plastic</option>
                  <option value="Paper">Paper</option>
                  <option value="Glass">Glass</option>
                  <option value="Metal">Metal</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Fill Level (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.currentFillPercent}
                  onChange={(e) => setFormData({ ...formData, currentFillPercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* LOCATION & ZONE */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              2. LOCATION & ZONE
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Address / Landmark *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Central Market, Sector 4 Gate Exit"
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-800 ${
                    errors.address ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.address && <span className="text-[10px] text-red-600 font-semibold">{errors.address}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Zone *</label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value as ZoneName })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Central Zone">Central Zone</option>
                  <option value="North Zone">North Zone</option>
                  <option value="South Zone">South Zone</option>
                  <option value="East Zone">East Zone</option>
                  <option value="West Zone">West Zone</option>
                  <option value="Industrial Zone">Industrial Zone</option>
                  <option value="Residential Zone">Residential Zone</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DEVICE & SENSOR */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              3. SENSOR TELEMETRY
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sensor ID *</label>
                <input
                  type="text"
                  value={formData.sensor?.sensorId || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sensor: { ...formData.sensor!, sensorId: e.target.value.toUpperCase() },
                    })
                  }
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono font-bold ${
                    errors.sensorId ? 'border-red-500' : 'border-slate-200'
                  }`}
                  placeholder="SNS-1087"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Battery Level (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.sensor?.batteryLevel || 100}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sensor: { ...formData.sensor!, batteryLevel: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Connectivity</label>
                <select
                  value={formData.sensor?.connectivity || 'Online'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sensor: { ...formData.sensor!, connectivity: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
            </div>
          </div>

          {/* COLLECTION & STATUS */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              4. OPERATIONAL STATUS
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Collection Priority</label>
                <select
                  value={formData.collectionPriority}
                  onChange={(e) =>
                    setFormData({ ...formData, collectionPriority: e.target.value as CollectionPriority })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Operational Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as BinStatus })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Normal">Normal</option>
                  <option value="Warning">Warning</option>
                  <option value="Critical">Critical</option>
                  <option value="Offline">Offline</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer border-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#064e3b] text-white hover:bg-[#047857] rounded-xl text-xs font-bold shadow-md cursor-pointer border-none flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Add Smart Bin'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
