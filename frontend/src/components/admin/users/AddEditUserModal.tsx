import React, { useState, useEffect } from 'react';
import type { PlatformUser, UserRole, UserStatus, ZoneName, CreateUserInput } from '../../../types/user';
import { X, UserPlus, UserCheck, CheckCircle2 } from 'lucide-react';

interface AddEditUserModalProps {
  isOpen: boolean;
  userToEdit: PlatformUser | null;
  onClose: () => void;
  onSubmitAdd: (input: CreateUserInput) => void;
  onSubmitEdit: (id: string, updates: Partial<PlatformUser>) => void;
  onViewCreatedUser?: (user: PlatformUser) => void;
}

export const AddEditUserModal: React.FC<AddEditUserModalProps> = ({
  isOpen,
  userToEdit,
  onClose,
  onSubmitAdd,
  onSubmitEdit,
  onViewCreatedUser,
}) => {
  const isEditing = !!userToEdit;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('DRIVER');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  const [organization, setOrganization] = useState('Waste Management Dept');
  const [department, setDepartment] = useState('Field Operations');
  const [zone, setZone] = useState<ZoneName>('Central Zone');
  const [assignedVehicleId, setAssignedVehicleId] = useState('TRK-021');
  const [assignedRouteId, setAssignedRouteId] = useState('R-104');
  const [analyticsScope, setAnalyticsScope] = useState<'All Zones' | 'Assigned Zones'>('All Zones');
  const [tempPassword, setTempPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [requirePasswordChange, setRequirePasswordChange] = useState(true);

  // Success State after User Creation
  const [createdSuccessUser, setCreatedSuccessUser] = useState<{
    name: string;
    email: string;
    role: string;
    status: string;
    rawUser?: PlatformUser;
  } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCreatedSuccessUser(null);
    if (userToEdit) {
      setFirstName(userToEdit.firstName || '');
      setLastName(userToEdit.lastName || '');
      setEmail(userToEdit.email || '');
      setPhone(userToEdit.phone || '');
      setRole(userToEdit.role || 'DRIVER');
      setStatus(userToEdit.status || 'ACTIVE');
      setOrganization(userToEdit.organization || 'Waste Management Dept');
      setDepartment(userToEdit.department || 'Field Operations');
      setZone(userToEdit.zone || 'Central Zone');
      setAssignedVehicleId(userToEdit.assignedVehicleId || 'TRK-021');
      setAssignedRouteId(userToEdit.assignedRouteId || 'R-104');
      setAnalyticsScope(userToEdit.analyticsScope || 'All Zones');
      setTempPassword('');
      setConfirmPassword('');
      setRequirePasswordChange(false);
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setRole('DRIVER');
      setStatus('ACTIVE');
      setOrganization('Waste Management Dept');
      setDepartment('Field Operations');
      setZone('Central Zone');
      setAssignedVehicleId('TRK-021');
      setAssignedRouteId('R-104');
      setAnalyticsScope('All Zones');
      setTempPassword('TempPass123!');
      setConfirmPassword('TempPass123!');
      setRequirePasswordChange(true);
    }
    setErrors({});
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'First name is required.';
    if (!lastName.trim()) errs.lastName = 'Last name is required.';
    
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errs.email = 'Please enter a valid email address.';
    } else {
      // Role email convention validation
      if (role === 'DRIVER' && !cleanEmail.endsWith('@driver.gmail.com')) {
        errs.email = 'Collection Driver accounts must use an @driver.gmail.com email.';
      } else if (role === 'ANALYST' && !cleanEmail.endsWith('@analyst.gmail.com')) {
        errs.email = 'Operations Analyst accounts must use an @analyst.gmail.com email.';
      }
    }

    if (phone && !/^\+?[0-9\s\-]{8,15}$/.test(phone)) {
      errs.phone = 'Invalid phone number format.';
    }

    if (!isEditing) {
      if (!tempPassword) {
        errs.tempPassword = 'Password is required.';
      } else if (tempPassword.length < 6) {
        errs.tempPassword = 'Password must be at least 6 characters.';
      }
      if (tempPassword !== confirmPassword) {
        errs.confirmPassword = 'Passwords do not match.';
      }
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
        assignedVehicleId: role === 'DRIVER' ? assignedVehicleId : undefined,
        assignedRouteId: role === 'DRIVER' ? assignedRouteId : undefined,
        analyticsScope: role === 'ANALYST' ? analyticsScope : undefined,
      });
      onClose();
    } else {
      const inputData: CreateUserInput = {
        firstName,
        lastName,
        email,
        phone,
        role,
        status,
        organization,
        department,
        zone,
        assignedVehicleId: role === 'DRIVER' ? assignedVehicleId : undefined,
        assignedRouteId: role === 'DRIVER' ? assignedRouteId : undefined,
        analyticsScope: role === 'ANALYST' ? analyticsScope : undefined,
        tempPassword,
        requirePasswordChange,
      };
      
      onSubmitAdd(inputData);

      // Transition to Success State Screen
      const roleLabel = role === 'DRIVER' ? 'Collection Driver' : role === 'ANALYST' ? 'Operations Analyst' : 'Waste Manager';
      setCreatedSuccessUser({
        name: `${firstName} ${lastName}`.trim(),
        email: email,
        role: roleLabel,
        status: status,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* SUCCESS CREATION STATE */}
        {createdSuccessUser ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">User Created Successfully</h3>
              <p className="text-xs text-slate-500 mt-1">
                {createdSuccessUser.role} account has been created and initialized.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left max-w-md mx-auto space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Full Name:</span>
                <span className="font-bold text-slate-900">{createdSuccessUser.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="font-bold font-mono text-emerald-700">{createdSuccessUser.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Role:</span>
                <span className="font-bold text-slate-900">{createdSuccessUser.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  {createdSuccessUser.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Done
              </button>
              {onViewCreatedUser && createdSuccessUser.rawUser && (
                <button
                  onClick={() => {
                    onViewCreatedUser(createdSuccessUser.rawUser!);
                    onClose();
                  }}
                  className="px-6 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  View User
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-900 text-white rounded-lg shadow-xs">
                  {isEditing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isEditing ? `Edit User: ${userToEdit?.firstName} ${userToEdit?.lastName}` : 'Add New User'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isEditing
                      ? `User ID: ${userToEdit?.userCode} • Update profile & workforce privileges.`
                      : 'Create credentials and assign access for a WasteWise team member.'}
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

                  <div className="col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={role === 'DRIVER' ? 'rahul@driver.gmail.com' : role === 'ANALYST' ? 'jay@analyst.gmail.com' : 'admin@example.com'}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:outline-none font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      {role === 'DRIVER'
                        ? 'Driver accounts must use @driver.gmail.com'
                        : role === 'ANALYST'
                        ? 'Analyst accounts must use @analyst.gmail.com'
                        : 'Standard admin email format.'}
                    </p>
                    {errors.email && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.email}</p>}
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
                </div>
              </div>

              {/* ROLE & WORKFORCE SCOPE */}
              <div>
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                  Role & Operational Scope
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Platform Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:outline-none bg-white font-bold text-slate-800"
                    >
                      <option value="DRIVER">Collection Driver</option>
                      <option value="ANALYST">Operations Analyst</option>
                      {isEditing && <option value="ADMIN">Waste Manager (Admin)</option>}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Assigned Zone</label>
                    <select
                      value={zone}
                      onChange={(e) => setZone(e.target.value as ZoneName)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:outline-none bg-white font-medium"
                    >
                      <option value="Central Zone">Central Zone</option>
                      <option value="North Zone">North Zone</option>
                      <option value="South Zone">South Zone</option>
                      <option value="East Zone">East Zone</option>
                      <option value="West Zone">West Zone</option>
                      <option value="Industrial Zone">Industrial Zone</option>
                      <option value="Residential Zone">Residential Zone</option>
                      <option value="All Zones">All Zones</option>
                    </select>
                  </div>

                  {/* CONDITIONAL FIELDS BASED ON ROLE */}
                  {role === 'DRIVER' && (
                    <>
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Assigned Vehicle</label>
                        <select
                          value={assignedVehicleId}
                          onChange={(e) => setAssignedVehicleId(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:outline-none bg-white font-mono"
                        >
                          <option value="TRK-021">TRK-021 (Compactor Truck)</option>
                          <option value="TRK-014">TRK-014 (Side-Loader)</option>
                          <option value="TRK-008">TRK-008 (Mini Collector)</option>
                          <option value="TRK-017">TRK-017 (Electric Hauler)</option>
                          <option value="Unassigned">Unassigned</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Initial Route Assignment</label>
                        <input
                          type="text"
                          value={assignedRouteId}
                          onChange={(e) => setAssignedRouteId(e.target.value)}
                          placeholder="e.g. R-104"
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-slate-500 focus:outline-none"
                        />
                      </div>
                    </>
                  )}

                  {role === 'ANALYST' && (
                    <div className="col-span-2">
                      <label className="block font-medium text-slate-700 mb-1">Analytics Access Scope</label>
                      <select
                        value={analyticsScope}
                        onChange={(e) => setAnalyticsScope(e.target.value as any)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-500 focus:outline-none bg-white font-medium"
                      >
                        <option value="All Zones">All Zones Analytics Scope</option>
                        <option value="Assigned Zones">Assigned Zones Scope Only</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* SECURITY & CREDENTIAL CREATION (Only if adding) */}
              {!isEditing && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                    Credential Creation & Security
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        placeholder="********"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-slate-500 focus:outline-none"
                      />
                      {errors.tempPassword && <p className="text-red-500 text-[11px] mt-1">{errors.tempPassword}</p>}
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="********"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-slate-500 focus:outline-none"
                      />
                      {errors.confirmPassword && <p className="text-red-500 text-[11px] mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-sm cursor-pointer"
                >
                  {isEditing ? 'Save Changes' : 'Create User Credentials'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
