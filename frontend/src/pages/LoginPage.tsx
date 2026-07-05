import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, UserCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
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

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm">
        {/* Head */}
        <div className="text-center space-y-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center font-extrabold text-white text-sm mx-auto">
            BN
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
          <p className="text-xs text-slate-400">
            Sign in to access your saved location intelligence.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs py-2.5 px-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
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
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
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
