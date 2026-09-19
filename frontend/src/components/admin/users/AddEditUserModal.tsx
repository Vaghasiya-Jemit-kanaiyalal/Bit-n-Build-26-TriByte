import React, { useState, useEffect } from 'react';
import type { PlatformUser, UserRole, UserStatus, ZoneName, CreateUserInput } from '../../../types/user';
import { X, UserPlus, UserCheck } from 'lucide-react';

interface AddEditUserModalProps {
  isOpen: boolean;
  userToEdit: PlatformUser | null;
  onClose: () => void;
  onSubmitAdd: (input: CreateUserInput) => void;
  onSubmitEdit: (id: string, updates: Partial<PlatformUser>) => void;
}

export const AddEditUserModal: React.FC<AddEditUserModalProps> = ({
  isOpen,
  userToEdit,
  onClose,
  onSubmitAdd,
  onSubmitEdit,
}) => {
  const isEditing = !!userToEdit;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('COLLECTOR');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  const [organization, setOrganization] = useState('Waste Management Dept');
  const [department, setDepartment] = useState('Field Operations');
  const [zone, setZone] = useState<ZoneName>('Central Zone');
  const [assignedVehicleId, setAssignedVehicleId] = useState('TRK-021');
  const [assignedRouteId, setAssignedRouteId] = useState('R-104');
  const [analyticsScope, setAnalyticsScope] = useState<'All Zones' | 'Assigned Zones'>('All Zones');
  const [tempPassword, setTempPassword] = useState('');
  const [requirePasswordChange, setRequirePasswordChange] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (userToEdit) {
      setFirstName(userToEdit.firstName || '');
      setLastName(userToEdit.lastName || '');
      setEmail(userToEdit.email || '');
      setPhone(userToEdit.phone || '');
      setRole(userToEdit.role || 'COLLECTOR');
      setStatus(userToEdit.status || 'ACTIVE');
      setOrganization(userToEdit.organization || 'Waste Management Dept');
      setDepartment(userToEdit.department || 'Field Operations');
      setZone(userToEdit.zone || 'Central Zone');
      setAssignedVehicleId(userToEdit.assignedVehicleId || 'TRK-021');
      setAssignedRouteId(userToEdit.assignedRouteId || 'R-104');
      setAnalyticsScope(userToEdit.analyticsScope || 'All Zones');
      setTempPassword('');
      setRequirePasswordChange(false);
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setRole('COLLECTOR');
      setStatus('ACTIVE');
      setOrganization('Waste Management Dept');
      setDepartment('Field Operations');
      setZone('Central Zone');
      setAssignedVehicleId('TRK-021');
      setAssignedRouteId('R-104');
      setAnalyticsScope('All Zones');
      setTempPassword('TempPass123!');
      setRequirePasswordChange(true);
    }
    setErrors({});
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'First name is required.';
    if (!lastName.trim()) errs.lastName = 'Last name is required.';
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (phone && !/^\+?[0-9\s\-]{8,15}$/.test(phone)) {
      errs.phone = 'Invalid phone number format.';
    }
    if (!isEditing && !tempPassword) {
      errs.tempPassword = 'Temporary password is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && userToEdit) {
      onSubmitEdit(userToEdit.id, {
        firstName,
        lastName,
        email,
        phone,
        role,
        status,
        organization,
        department,
        zone,
        assignedVehicleId: (role === 'COLLECTOR' || role === 'DRIVER') ? assignedVehicleId : undefined,
        assignedRouteId: (role === 'COLLECTOR' || role === 'DRIVER') ? assignedRouteId : undefined,
        analyticsScope: (role === 'VIEWER' || role === 'ANALYST') ? analyticsScope : undefined,
      });
    } else {
      onSubmitAdd({
        firstName,
        lastName,
        email,
        phone,
        role,
        status,
        organization,
        department,
        zone,
        assignedVehicleId: (role === 'COLLECTOR' || role === 'DRIVER') ? assignedVehicleId : undefined,
        assignedRouteId: (role === 'COLLECTOR' || role === 'DRIVER') ? assignedRouteId : undefined,
        analyticsScope: (role === 'VIEWER' || role === 'ANALYST') ? analyticsScope : undefined,
        tempPassword,
        requirePasswordChange,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-900 text-white rounded-lg">
              {isEditing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isEditing ? `Edit User: ${userToEdit?.firstName} ${userToEdit?.lastName}` : 'Add New Platform User'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? `User ID: ${userToEdit?.userCode} • Update profile & workforce privileges.`
                  : 'Register a new workforce member or platform manager.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* PERSONAL INFORMATION */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
              Personal Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Rahul"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:outline-none"
                />
                {errors.firstName && <p className="text-red-500 text-[11px] mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Patel"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:outline-none"
                />
                {errors.lastName && <p className="text-red-500 text-[11px] mt-1">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul.patel@example.com"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:outline-none"
                />
                {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:outline-none"
                />
                {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* ROLE & ACCOUNT STATUS */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
              Account & System Privilege Role
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Platform Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:outline-none bg-white font-medium"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="COLLECTOR">Collector</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Account Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as UserStatus)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:outline-none bg-white font-medium"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending Invitation</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Organization</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECURITY & AUTH (Only if adding) */}
          {!isEditing && (
            <div>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                Security & Temporary Password
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Temporary Password</label>
                  <input
                    type="text"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    placeholder="TempPass123!"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-slate-500 focus:outline-none"
                  />
                  {errors.tempPassword && <p className="text-red-500 text-[11px] mt-1">{errors.tempPassword}</p>}
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={requirePasswordChange}
                      onChange={(e) => setRequirePasswordChange(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                    />
                    <span>Require password change on first login</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-sm"
            >
              {isEditing ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
