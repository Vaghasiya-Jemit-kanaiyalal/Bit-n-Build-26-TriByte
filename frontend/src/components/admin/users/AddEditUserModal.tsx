import React, { useState, useEffect } from 'react';
import type { PlatformUser, UserRole, UserStatus, CreateUserInput } from '../../../types/user';
import { ROLE_LABELS } from '../../../types/user';
import { X, UserPlus, UserCheck, CheckCircle2, AlertTriangle, Truck, BarChart3, PlusCircle } from 'lucide-react';
import { authService } from '../../../services/authService';

export interface AddEditUserModalProps {
  open?: boolean;
  isOpen?: boolean;
  userToEdit?: PlatformUser | null;
  onClose: () => void;
  onSubmitAdd?: (input: CreateUserInput) => Promise<void>;
  onSubmitEdit?: (id: string, updates: Partial<PlatformUser>) => Promise<void> | void;
  onViewCreatedUser?: (user: PlatformUser) => void;
}

export const AddEditUserModal: React.FC<AddEditUserModalProps> = ({
  open,
  isOpen,
  userToEdit = null,
  onClose,
  onSubmitAdd,
  onSubmitEdit,
  onViewCreatedUser,
}) => {
  // Support both 'open' and 'isOpen' prop conventions
  const isModalOpen = open ?? isOpen ?? false;
  const isEditing = !!userToEdit;

  // 1. All hook declarations unconditionally at top of component
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('DRIVER');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  const [tempPassword, setTempPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [requirePasswordChange, setRequirePasswordChange] = useState(true);

  // Role Change Confirmation State
  const [showRoleChangeWarning, setShowRoleChangeWarning] = useState(false);

  // Submitting & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Success State after User Creation
  const [createdSuccessUser, setCreatedSuccessUser] = useState<{
    name: string;
    email: string;
    role: string;
    status: string;
    rawUser?: PlatformUser;
  } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or initialize form values whenever modal opens or userToEdit changes
  useEffect(() => {
    setCreatedSuccessUser(null);
    setShowRoleChangeWarning(false);
    setSubmitError(null);

    if (userToEdit) {
      setFirstName(userToEdit.firstName || '');
      setLastName(userToEdit.lastName || '');
      setEmail(userToEdit.email || '');
      setPhone(userToEdit.phone || '');
      setRole(userToEdit.role || 'DRIVER');
      setStatus(userToEdit.status || 'ACTIVE');
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
      setTempPassword('TempPass123!');
      setConfirmPassword('TempPass123!');
      setRequirePasswordChange(true);
    }
    setErrors({});
  }, [userToEdit, isModalOpen]);

  // Handle email changes
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
  };

  // Adjust role when selected
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
  };

  const handleResetForAnother = () => {
    setCreatedSuccessUser(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setRole('VIEWER');
    setStatus('ACTIVE');
    setTempPassword('TempPass123!');
    setConfirmPassword('TempPass123!');
    setSubmitError(null);
    setErrors({});
  };

  // 2. Conditional return safely placed AFTER all hooks
  if (!isModalOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'First name is required.';
    if (!lastName.trim()) errs.lastName = 'Last name is required.';

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errs.email = 'Please enter a valid email address.';
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

  const executeEditSubmit = async () => {
    if (!userToEdit || !onSubmitEdit) return;
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await onSubmitEdit(userToEdit.id, {
        firstName,
        lastName,
        email: email.trim().toLowerCase(),
        phone,
        role,
        status,
      });
      setShowRoleChangeWarning(false);
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to update user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && userToEdit) {
      if (userToEdit.role !== role && !showRoleChangeWarning) {
        setShowRoleChangeWarning(true);
        return;
      }
      await executeEditSubmit();
    } else {
      if (!onSubmitAdd) {
        onClose();
        return;
      }

      const inputData: CreateUserInput = {
        firstName,
        lastName,
        email: email.trim().toLowerCase(),
        phone,
        role,
        status,
        organization: 'EcoTrack AI Waste Management',
        department: role === 'DRIVER' ? 'Field Operations' : role === 'ANALYST' ? 'Analytics' : 'Management',
        tempPassword,
        requirePasswordChange,
      };

      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await onSubmitAdd(inputData);
        const mappedRoleLabel =
          role === 'DRIVER'
            ? 'Collection Driver'
            : role === 'ANALYST'
            ? 'Operations Analyst'
            : 'Waste Manager';

        setCreatedSuccessUser({
          name: `${firstName} ${lastName}`.trim(),
          email: email.trim().toLowerCase(),
          role: mappedRoleLabel,
          status: status,
        });
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to create user. Please check credentials and try again.';
        if (
          errorMsg.toLowerCase().includes('signature has expired') ||
          errorMsg.toLowerCase().includes('invalid token') ||
          errorMsg.toLowerCase().includes('could not validate credentials')
        ) {
          setSubmitError('Your admin session has expired. Please sign in again to refresh credentials.');
        } else {
          setSubmitError(errorMsg);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[1000000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">

        {/* ROLE CHANGE WARNING CONFIRMATION STATE */}
        {showRoleChangeWarning ? (
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 text-amber-800 bg-amber-50 p-4 rounded-xl border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-900">Role Change Confirmation</h4>
                <p className="text-xs text-amber-800 mt-1">
                  Changing this user's role will update their workspace dashboard and portal redirection.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Current Role:</span>
                <span className="font-bold text-slate-800">
                  {userToEdit?.role ? (ROLE_LABELS[userToEdit.role as keyof typeof ROLE_LABELS] || userToEdit.role) : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">New Target Role:</span>
                <span className="font-bold text-emerald-700">
                  {ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role}
                </span>
              </div>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {submitError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowRoleChangeWarning(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeEditSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? 'Updating...' : 'Confirm Role Change'}
              </button>
            </div>
          </div>
        ) : createdSuccessUser ? (
          /* SUCCESS STATE AFTER USER CREATION */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">User Created Successfully</h3>
              <p className="text-xs text-slate-500 mt-1">
                {createdSuccessUser.role} account is active and can log in immediately.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left max-w-md mx-auto space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Full Name:</span>
                <span className="font-bold text-slate-900">{createdSuccessUser.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="font-bold font-mono text-emerald-700">{createdSuccessUser.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Assigned Role:</span>
                <span className="font-bold text-slate-900">{createdSuccessUser.role}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Login Destination:</span>
                <span className="font-semibold text-emerald-700">
                  {createdSuccessUser.role === 'Collection Driver'
                    ? 'Driver Dashboard (/driver/dashboard)'
                    : createdSuccessUser.role === 'Operations Analyst'
                    ? 'Analyst Dashboard (/analyst/dashboard)'
                    : 'Admin Management (/admin/dashboard)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {createdSuccessUser.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetForAnother}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Another</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                Done
              </button>
              {onViewCreatedUser && createdSuccessUser.rawUser && (
                <button
                  type="button"
                  onClick={() => {
                    onViewCreatedUser(createdSuccessUser.rawUser!);
                    onClose();
                  }}
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  View User
                </button>
              )}
            </div>
          </div>
        ) : (
          /* USER FORM BODY - CLEAN, STREAMLINED */
          <>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-xs">
                  {isEditing ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isEditing ? `Edit User: ${userToEdit?.firstName} ${userToEdit?.lastName}` : 'Add New User'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isEditing
                      ? `Update account details for ${userToEdit?.email}.`
                      : 'Create driver or analyst credentials for workforce platform access.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Rahul"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all"
                  />
                  {errors.firstName && <p className="text-red-500 text-[11px] mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Patel"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all"
                  />
                  {errors.lastName && <p className="text-red-500 text-[11px] mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder={
                    role === 'DRIVER'
                      ? 'rahul@driver.gmail.com'
                      : role === 'ANALYST'
                      ? 'jay@analyst.gmail.com'
                      : 'admin@ecotrack.com'
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none font-mono transition-all"
                />
                <div className="flex items-center gap-2 mt-1 text-[11px]">
                  {role === 'DRIVER' ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      Driver email convention: must end with <strong>@driver.gmail.com</strong>
                    </span>
                  ) : role === 'ANALYST' ? (
                    <span className="text-blue-700 font-semibold flex items-center gap-1">
                      <BarChart3 className="w-3.5 h-3.5" />
                      Analyst email convention: must end with <strong>@analyst.gmail.com</strong>
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium">
                      Admin email format.
                    </span>
                  )}
                </div>
                {errors.email && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.email}</p>}
              </div>

              {/* Role & Status Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Platform Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none bg-white font-bold text-slate-900"
                  >
                    <option value="VIEWER">System Viewer (Read-Only Default)</option>
                    <option value="DRIVER">Collection Driver</option>
                    <option value="ANALYST">Operations Analyst</option>
                    <option value="ADMIN">Waste Manager (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as UserStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none bg-white font-medium"
                  >
                    <option value="ACTIVE">Active (Immediate Login)</option>
                    <option value="PENDING">Pending Invitation</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Password Section (when creating new user) */}
              {!isEditing && (
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                    Password & Credentials
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
                      />
                      {errors.tempPassword && <p className="text-red-500 text-[11px] mt-1">{errors.tempPassword}</p>}
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
                      />
                      {errors.confirmPassword && <p className="text-red-500 text-[11px] mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <div className="col-span-2 mt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
                        <input
                          type="checkbox"
                          checked={requirePasswordChange}
                          onChange={(e) => setRequirePasswordChange(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <span className="text-xs font-medium text-slate-600">
                          Require user to update password on first login
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* API Error Banner */}
              {submitError && (
                <div className="flex items-start justify-between gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 leading-snug font-medium">{submitError}</p>
                  </div>
                  {submitError.toLowerCase().includes('session has expired') && (
                    <button
                      type="button"
                      onClick={() => {
                        authService.logout();
                        window.location.href = '/login';
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer border-none shadow-xs"
                    >
                      Sign In Again
                    </button>
                  )}
                </div>
              )}

              {/* Form Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#047857] hover:bg-[#064e3b] rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60 flex items-center gap-2 border-none"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                      <span>{isEditing ? 'Saving Changes...' : 'Creating User...'}</span>
                    </>
                  ) : (
                    <span>{isEditing ? 'Save Changes' : 'Create User Credentials'}</span>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AddEditUserModal;
