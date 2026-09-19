"use client";

import * as React from "react";
import { useState } from "react";
import { Leaf, Mail, Lock, Eye, EyeOff, Trash2, User, BarChart3, ArrowRight, UserPlus, CheckCircle2 } from "lucide-react";
import authBgImage from "../../assets/authbg.jpeg";

export interface SignIn1Props {
  onSignInSuccess?: (role: string, email: string) => void;
  bgOpacity?: number;
}

const SignIn1: React.FC<SignIn1Props> = ({
  onSignInSuccess,
  bgOpacity = 0.55,
}) => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  
  // Sign In State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("Admin");
  const [signInError, setSignInError] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);

  // Sign Up State
  const [fullName, setFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpRole, setSignUpRole] = useState<string>("Admin");
  const [signUpError, setSignUpError] = useState("");
  const [signUpSuccessMsg, setSignUpSuccessMsg] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);

  const demoRoles = [
    {
      id: "Admin",
      title: "Admin",
      email: "admin@ecotrack.com",
      pass: "admin123",
      badge: "Full Access",
      icon: Trash2,
      iconBg: "bg-emerald-100 text-emerald-700",
      badgeBg: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "Collector / Driver",
      title: "Collector / Driver",
      email: "driver@ecotrack.com",
      pass: "driver123",
      badge: "Collection App",
      icon: User,
      iconBg: "bg-blue-100 text-blue-700",
      badgeBg: "bg-blue-100 text-blue-800",
    },
    {
      id: "Viewer / Analyst",
      title: "Viewer / Analyst",
      email: "viewer@ecotrack.com",
      pass: "viewer123",
      badge: "Read-Only",
      icon: BarChart3,
      iconBg: "bg-purple-100 text-purple-700",
      badgeBg: "bg-purple-100 text-purple-800",
    },
  ];

  const handleSelectDemo = (roleObj: typeof demoRoles[0]) => {
    setSelectedRole(roleObj.id);
    setEmail(roleObj.email);
    setPassword(roleObj.pass);
    setSignInError("");
  };

  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleSignIn = (e?: React.FormEvent) => {
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

    setTimeout(() => {
      setSignInLoading(false);
      if (onSignInSuccess) {
        onSignInSuccess(selectedRole, email);
      } else {
        alert(`Signed in as ${selectedRole} (${email})`);
      }
    }, 500);
  };

  const handleSignUp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName || !signUpEmail || !signUpPassword || !confirmPassword) {
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

    setTimeout(() => {
      setSignUpLoading(false);
      setSignUpSuccessMsg("Account created successfully! Switching to sign in...");
      setTimeout(() => {
        setEmail(signUpEmail);
        setPassword(signUpPassword);
        setSelectedRole(signUpRole);
        setActiveTab("signin");
        setSignUpSuccessMsg("");
      }, 1000);
    }, 500);
  };

  return (
    <div className="h-screen w-screen max-h-screen max-w-screen overflow-hidden flex flex-col items-center justify-center relative p-3 sm:p-4 font-sans select-none bg-slate-950 text-slate-900">
      {/* Background Image (authbg.jpeg) */}
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-500 z-0"
        style={{
          backgroundImage: `url(${authBgImage})`,
          opacity: bgOpacity,
        }}
      />

      {/* Dark Backdrop Overlay */}
      <div className="fixed inset-0 bg-slate-950/50 pointer-events-none z-0" />

      {/* Centered Viewport Wrapper (100% Fits Screen) */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md flex flex-col items-center justify-center my-auto">
        
        {/* EcoTrack Brand Header - Bright Visible Typography */}
        <div className="flex flex-col items-center mb-2.5 sm:mb-3 text-center shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#047857] shadow-lg flex items-center justify-center mb-1.5 border border-emerald-400/30">
            <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight drop-shadow-md m-0 p-0 leading-tight">
            EcoTrack
          </h1>
          <p className="text-xs sm:text-sm font-bold text-white mt-0.5 mb-0 p-0 leading-tight drop-shadow">
            AI-Powered Waste Management
          </p>
          <p className="text-[11px] sm:text-xs font-semibold text-emerald-200/90 mt-0.5 mb-0 p-0 leading-tight drop-shadow">
            Cleaner Cities &bull; Smarter Collection &bull; Greener Tomorrow
          </p>
        </div>

        {/* Crisp White Card - Height Balanced for 100vh */}
        <div className="w-full bg-white rounded-2xl shadow-2xl p-4 sm:p-5 border border-slate-100 flex flex-col text-slate-900 shrink-0">
          
          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-200 mb-3.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab("signin");
                setSignInError("");
                setSignUpError("");
              }}
              className={`flex-1 pb-2 text-center text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer bg-transparent ${
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
              className={`flex-1 pb-2 text-center text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer bg-transparent ${
                activeTab === "signup"
                  ? "border-[#047857] text-[#047857]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* SIGN IN TAB CONTENT */}
          {activeTab === "signin" && (
            <form onSubmit={handleSignIn} className="flex flex-col">
              <div className="flex flex-col gap-2.5">
                
                {/* Email Address */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[11px] font-bold text-slate-700 m-0 p-0 block">
                    Email Address
                  </label>
                  <div className="relative flex items-center w-full">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input
                      placeholder="Enter your email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-9 sm:h-10 pl-9 pr-3 rounded-lg bg-slate-50 text-slate-900 text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[11px] font-bold text-slate-700 m-0 p-0 block">
                    Password
                  </label>
                  <div className="relative flex items-center w-full">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-9 sm:h-10 pl-9 pr-9 rounded-lg bg-slate-50 text-slate-900 text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-slate-400 hover:text-slate-600 focus:outline-none bg-transparent border-none p-1 flex items-center justify-center cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {signInError && (
                  <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 font-medium text-left">
                    {signInError}
                  </div>
                )}

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={signInLoading}
                  className="mt-0.5 w-full h-9 sm:h-10 bg-[#047857] hover:bg-[#064e3b] active:bg-[#022c22] text-white font-bold rounded-lg shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer border-none disabled:opacity-60"
                >
                  {signInLoading ? "Signing in..." : "Sign In to EcoTrack"}
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3 py-0.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative z-10 bg-white px-2.5 text-[9px] sm:text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                  DEMO ACCOUNTS (FOR TESTING)
                </span>
              </div>

              {/* 3 Role Selection Cards */}
              <div className="flex flex-col gap-2">
                {demoRoles.map((role) => {
                  const IconComp = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <div
                      key={role.id}
                      onClick={() => handleSelectDemo(role)}
                      className={`flex flex-row items-center justify-between p-2 sm:p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#047857] bg-emerald-50/90 shadow-sm"
                          : "border-slate-200 bg-slate-50/80 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${role.iconBg} flex items-center justify-center shrink-0`}>
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col text-left truncate">
                          <span className="text-[11px] sm:text-xs font-bold text-slate-900 truncate leading-tight m-0">
                            {role.title}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate leading-tight m-0">
                            {role.email} &bull; {role.pass}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ml-1.5 ${role.badgeBg}`}>
                        {role.badge}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Continue Link */}
              <button
                type="button"
                onClick={() => handleSignIn()}
                className="mt-3 text-center text-[11px] sm:text-xs font-bold text-slate-600 hover:text-[#047857] transition-colors flex items-center justify-center gap-1 cursor-pointer bg-transparent border-none p-0 w-full"
              >
                Continue to Dashboard <ArrowRight className="w-3 h-3" />
              </button>
            </form>
          )}

          {/* CREATE ACCOUNT TAB CONTENT */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignUp} className="flex flex-col gap-2 sm:gap-2.5">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[11px] font-bold text-slate-700 m-0 p-0 block">
                  Full Name
                </label>
                <div className="relative flex items-center w-full">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    placeholder="Enter your full name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-8 sm:h-9 pl-9 pr-3 rounded-lg bg-slate-50 text-slate-900 text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[11px] font-bold text-slate-700 m-0 p-0 block">
                  Email Address
                </label>
                <div className="relative flex items-center w-full">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    placeholder="name@ecotrack.com"
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full h-8 sm:h-9 pl-9 pr-3 rounded-lg bg-slate-50 text-slate-900 text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Preferred Role Selection */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[11px] font-bold text-slate-700 m-0 p-0 block">
                  Select System Role
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {demoRoles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSignUpRole(r.id)}
                      className={`h-7 sm:h-8 px-1 rounded text-[11px] font-bold border transition-all cursor-pointer truncate ${
                        signUpRole === r.id
                          ? "bg-[#047857] text-white border-[#047857]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {r.title.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[11px] font-bold text-slate-700 m-0 p-0 block">
                  Password
                </label>
                <div className="relative flex items-center w-full">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    placeholder="Create a password"
                    type={showSignUpPassword ? "text" : "password"}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full h-8 sm:h-9 pl-9 pr-8 rounded-lg bg-slate-50 text-slate-900 text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white transition-all placeholder:text-slate-400"
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
                <label className="text-[11px] font-bold text-slate-700 m-0 p-0 block">
                  Confirm Password
                </label>
                <div className="relative flex items-center w-full">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    placeholder="Confirm your password"
                    type={showSignUpPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-8 sm:h-9 pl-9 pr-3 rounded-lg bg-slate-50 text-slate-900 text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {signUpError && (
                <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 font-medium text-left">
                  {signUpError}
                </div>
              )}

              {signUpSuccessMsg && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-medium flex items-center gap-1.5 text-left">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{signUpSuccessMsg}</span>
                </div>
              )}

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={signUpLoading}
                className="mt-1 w-full h-8 sm:h-9 bg-[#047857] hover:bg-[#064e3b] text-white font-bold rounded-lg shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer border-none disabled:opacity-60"
              >
                {signUpLoading ? "Creating Account..." : "Create EcoTrack Account"}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("signin")}
                className="mt-1 text-center text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors bg-transparent border-none cursor-pointer"
              >
                Already have an account? <span className="text-[#047857] font-bold underline">Sign In</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-[10px] sm:text-[11px] text-white/90 font-semibold mt-2.5 text-center drop-shadow-md m-0 p-0 shrink-0">
          &copy; 2026 EcoTrack. Together for a Cleaner, Greener Tomorrow.
        </p>
      </div>
    </div>
  );
};

export { SignIn1 };
export default SignIn1;
