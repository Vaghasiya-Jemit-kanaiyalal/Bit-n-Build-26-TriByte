import React from 'react';
import type { VehicleItem } from '../../mock/vehicleData';

interface VehicleStatusBadgeProps {
  status: VehicleItem['status'];
}

export const VehicleStatusBadge: React.FC<VehicleStatusBadgeProps> = ({ status }) => {
  let badgeStyles = 'bg-gray-100 text-gray-800 border-gray-200';

  if (status === 'On Route') {
    badgeStyles = 'bg-[#738a62]/15 text-[#738a62] border-[#738a62]/30';
  } else if (status === 'Active' || status === 'Available') {
    badgeStyles = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  } else if (status === 'Idle') {
    badgeStyles = 'bg-blue-100 text-blue-800 border-blue-200';
  } else if (status === 'Maintenance') {
    badgeStyles = 'bg-amber-100 text-amber-800 border-amber-200';
  } else if (status === 'Offline') {
    badgeStyles = 'bg-red-100 text-red-800 border-red-200';
  }

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeStyles}`}>
      {status}
    </span>
  );
};

export default VehicleStatusBadge;
