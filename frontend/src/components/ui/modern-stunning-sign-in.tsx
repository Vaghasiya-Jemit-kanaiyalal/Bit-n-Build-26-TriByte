"use client";

import * as React from "react";
import { useState } from "react";
import { Leaf, Mail, Lock, Eye, EyeOff, UserPlus, CheckCircle2 } from "lucide-react";
import authBgImage from "../../assets/authbg.jpeg";
import faviconImg from "../../assets/favicon.png";
import logoTextImg from "../../assets/logo_text.png";
import { authService } from "../../services/authService";
import { showWebsiteToast } from "../common/NotificationToast";

interface SignIn1Props {
  onSignInSuccess?: (role: string, email: string, userRecord?: any) => void;
  bgOpacity?: number;
}

const SignIn1: React.FC<SignIn1Props> = ({
  onSignInSuccess,
  bgOpacity = 0.55,
}) => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  
  // Sign In State - ONLY Email and Password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signInError, setSignInError] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);

  // Sign Up State - ONLY Full Name, Email, Password, Confirm Password
  const [fullName, setFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpError, setSignUpError] = useState("");
  const [signUpSuccessMsg, setSignUpSuccessMsg] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);

  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setSignInError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setSignInError("Please enter a valid email address.");
      return;
    }
    setSignInError("");
    setSignInLoading(true);

    try {
      // Authenticate via database/backend API
      const authData = await authService.login(email, password);
      setSignInLoading(false);

      if (authData.user.status === 'SUSPENDED') {
        setSignInError("Your account has been suspended. Please contact your system administrator.");
        showWebsiteToast("Account Suspended", "error", "Access Denied");
        return;
      }
      if (authData.user.status === 'INACTIVE') {
        setSignInError("Your account is currently inactive. Please contact support.");
        showWebsiteToast("Account Inactive", "error", "Access Denied");
        return;
      }

      showWebsiteToast(`Welcome back, ${authData.user.full_name}!`, "success", "Authentication Successful");

      if (onSignInSuccess) {
        onSignInSuccess(authData.user.role, authData.user.email, authData.user);
      }
    } catch (err: any) {
      setSignInLoading(false);
      setSignInError(err.message || "Invalid email or password.");
    }
  };

  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName.trim() || !signUpEmail.trim() || !signUpPassword || !confirmPassword) {
      setSignUpError("Please fill out all required fields.");
      return;
    }
    if (!validateEmail(signUpEmail)) {
      setSignUpError("Please enter a valid email address.");
      return;
    }
    if (signUpPassword.length < 6) {
      setSignUpError("Password must be at least 6 characters.");
      return;
    }
    if (signUpPassword !== confirmPassword) {
      setSignUpError("Passwords do not match.");
      return;
    }
    setSignUpError("");
    setSignUpLoading(true);

    try {
      await authService.register(fullName, signUpEmail, signUpPassword);
      setSignUpLoading(false);
      setSignUpSuccessMsg("Account created successfully! Switching to sign in...");
      showWebsiteToast("Account created successfully! Please sign in.", "success", "Registration Complete");

      setTimeout(() => {
        setEmail(signUpEmail);
        setPassword(signUpPassword);
        setActiveTab("signin");
        setSignUpSuccessMsg("");
      }, 1000);
    } catch (err: any) {
      setSignUpLoading(false);
      setSignUpError(err.message || "Failed to create account.");
    }
  };

  return (
    <div className="h-screen w-screen max-h-screen max-w-screen overflow-hidden flex flex-col items-center justify-center relative p-3 sm:p-4 font-sans select-none bg-slate-950 text-slate-900">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-500 z-0"
        style={{
          backgroundImage: `url(${authBgImage})`,
          opacity: bgOpacity,
        }}
      />

      {/* Dark Backdrop Overlay */}
      <div className="fixed inset-0 bg-slate-950/50 pointer-events-none z-0" />

      {/* Centered Viewport Wrapper */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md flex flex-col items-center justify-center my-auto">
        
        {/* EcoTrack Brand Header */}
        <div className="flex flex-col items-center mb-4 sm:mb-5 text-center shrink-0">
          <img
            src={faviconImg}
            alt="EcoTrack Icon"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain mb-3 drop-shadow-2xl"
          />
          <img
            src={logoTextImg}
            alt="EcoTrack"
            className="h-20 sm:h-26 max-w-full w-auto object-contain drop-shadow-lg"
          />
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-2xl shadow-2xl p-5 sm:p-6 border border-slate-100 flex flex-col text-slate-900 shrink-0">
          
          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-200 mb-4">
            <button
              type="button"
              onClick={() => {
                setActiveTab("signin");
                setSignInError("");
                setSignUpError("");
              }}
              className={`flex-1 pb-2.5 text-center text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer bg-transparent ${
                activeTab === "signin"
                  ? "border-[#047857] text-[#047857]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("signup");
                setSignInError("");
                setSignUpError("");
              }}
              className={`flex-1 pb-2.5 text-center text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer bg-transparent ${
                activeTab === "signup"
                  ? "border-[#047857] text-[#047857]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* SIGN IN TAB CONTENT - ONLY EMAIL & PASSWORD */}
          {activeTab === "signin" && (
            <form onSubmit={handleSignIn} className="flex flex-col gap-3">
              <div className="flex flex-col gap-3">
                
                {/* Email Address */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-bold text-slate-700 m-0 p-0 block">
                    Email Address
                  </label>
                  <div className="relative flex items-center w-full">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      placeholder="Enter your registered email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 text-slate-900 text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white transition-all placeholder:text-slate-400"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-bold text-slate-700 m-0 p-0 block">
                    Password
                  </label>
                  <div className="relative flex items-center w-full">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-10 pl-9 pr-10 rounded-lg bg-slate-50 text-slate-900 text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white transition-all placeholder:text-slate-400"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-slate-400 hover:text-slate-600 focus:outline-none bg-transparent border-none p-1 flex items-center justify-center cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {signInError && (
                  <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 font-medium text-left">
                    {signInError}
                  </div>
                )}

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={signInLoading}
                  className="mt-1 w-full h-10 bg-[#047857] hover:bg-[#064e3b] active:bg-[#022c22] text-white font-bold rounded-lg shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer border-none disabled:opacity-60"
                >
                  {signInLoading ? "Verifying Credentials..." : "Sign In to EcoTrack"}
                </button>
              </div>

              <div className="mt-2 text-center text-[11px] text-slate-500 font-medium">
                Roles and access privileges are resolved securely from your database profile.
              </div>
            </form>
          )}

          {/* CREATE ACCOUNT TAB CONTENT - NO ROLE SELECTION */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignUp} className="flex flex-col gap-2.5">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-bold text-slate-700 m-0 p-0 block">
                  Full Name
                </label>
                <div className="relative flex items-center w-full">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    placeholder="Enter your full name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 text-slate-900 text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-bold text-slate-700 m-0 p-0 block">
                  Email Address
                </label>
                <div className="relative flex items-center w-full">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    placeholder="Enter your email address"
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 text-slate-900 text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-bold text-slate-700 m-0 p-0 block">
                  Password
                </label>
                <div className="relative flex items-center w-full">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    placeholder="Create a password (min 6 characters)"
                    type={showSignUpPassword ? "text" : "password"}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full h-9 pl-9 pr-9 rounded-lg bg-slate-50 text-slate-900 text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-400 hover:text-slate-600 focus:outline-none bg-transparent border-none p-1 flex items-center justify-center cursor-pointer"
                  >
                    {showSignUpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-bold text-slate-700 m-0 p-0 block">
                  Confirm Password
                </label>
                <div className="relative flex items-center w-full">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    placeholder="Confirm your password"
                    type={showSignUpPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 text-slate-900 text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {signUpError && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 font-medium text-left">
                  {signUpError}
                </div>
              )}

              {signUpSuccessMsg && (
                <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-medium flex items-center gap-1.5 text-left">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{signUpSuccessMsg}</span>
                </div>
              )}

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={signUpLoading}
                className="mt-1 w-full h-9 bg-[#047857] hover:bg-[#064e3b] text-white font-bold rounded-lg shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer border-none disabled:opacity-60"
              >
                {signUpLoading ? "Creating Account..." : "Create EcoTrack Account"}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("signin")}
                className="mt-1 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors bg-transparent border-none cursor-pointer"
              >
                Already have an account? <span className="text-[#047857] font-bold underline">Sign In</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-white/90 font-semibold mt-3 text-center drop-shadow-md m-0 p-0 shrink-0">
          &copy; 2026 EcoTrack. Together for a Cleaner, Greener Tomorrow.
        </p>
      </div>
    </div>
  );
};

export { SignIn1 };
export default SignIn1;
