import React from 'react';
import type { UserRole } from '../../../types/user';

interface UserAvatarProps {
  initials?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: UserRole;
  bgColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  initials,
  firstName,
  lastName,
  bgColor,
  role,
  size = 'md',
}) => {
  const derivedInitials =
    initials ||
    (firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : firstName
      ? firstName.substring(0, 2).toUpperCase()
      : 'US');

  const defaultBg =
    role === 'ADMIN'
      ? 'bg-[#064e3b] text-white'
      : role === 'ANALYST'
      ? 'bg-purple-700 text-white'
      : 'bg-emerald-600 text-white';

  const finalBg = bgColor || defaultBg;

  const sizeClasses =
    size === 'sm'
      ? 'w-7 h-7 text-[10px]'
      : size === 'lg'
      ? 'w-12 h-12 text-base'
      : 'w-9 h-9 text-xs';

  return (
    <div
      className={`${sizeClasses} rounded-full ${finalBg} font-extrabold flex items-center justify-center shrink-0 shadow-xs uppercase tracking-tight`}
    >
      {derivedInitials}
    </div>
  );
};
