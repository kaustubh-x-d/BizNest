import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, UserCheck, ArrowLeft, KeyRound, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";

export default function LoginPage() {
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Recovery States
  const [isForgot, setIsForgot] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim() || !newPassword.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        full_name: fullName,
        new_password: newPassword
      });
      setSuccessMsg("Password reset successfully! Try logging in now.");
      setIsForgot(false);
      setPassword("");
      setFullName("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Reset failed. Verify your name and email.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm">
        
        {/* Toggle Head depending on Forgot mode */}
        {!isForgot ? (
          <div className="text-center space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center font-extrabold text-white text-sm mx-auto">
              BN
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-xs text-slate-400">
              Sign in to access your saved location intelligence.
            </p>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center font-extrabold text-white text-sm mx-auto">
              <KeyRound className="w-4 h-4 text-slate-100" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reset Password</h2>
            <p className="text-xs text-slate-400">
              Verify your registered email and full name to set a new password.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs py-2.5 px-4 rounded-lg">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs py-2.5 px-4 rounded-lg">
            {successMsg}
          </div>
        )}

        {/* Dynamic Forms */}
        {!isForgot ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgot(true);
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="text-[10px] font-bold text-slate-650 hover:text-black hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsForgot(false);
                  setError("");
                  setSuccessMsg("");
                }}
                className="w-1/3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5" />
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}

        {!isForgot && (
          <>
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-150"></div>
              <span className="flex-shrink mx-4 text-[10px] text-slate-400 uppercase font-bold">Or</span>
              <div className="flex-grow border-t border-slate-150"></div>
            </div>

            <button
              onClick={handleGuestLogin}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-slate-650" />
              Continue in Guest Mode
            </button>
          </>
        )}

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{" "}
          <Link to="/signup" className="font-bold text-slate-900 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
