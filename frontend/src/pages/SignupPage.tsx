import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, PlusCircle, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [budgetTier, setBudgetTier] = useState<string>("medium");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signup(email, password, fullName, budgetTier);
      setIsRegistered(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm">
        
        {!isRegistered ? (
          <>
            {/* Head */}
            <div className="text-center space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center font-extrabold text-white text-sm mx-auto">
                BN
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create Account</h2>
              <p className="text-xs text-slate-400">
                Sign up to save analysis reports.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs py-2.5 px-4 rounded-lg text-left">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
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
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Budget Tier</label>
                <div className="relative">
                  <select
                    value={budgetTier}
                    onChange={(e) => setBudgetTier(e.target.value)}
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="low">Low Budget (&lt; 5L)</option>
                    <option value="medium">Medium Budget (5L - 15L)</option>
                    <option value="high">High Budget (&gt; 15L)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-slate-900 hover:underline">
                Sign In here
              </Link>
            </p>
          </>
        ) : (
          <div className="text-center py-6 space-y-6">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans">Verify your email</h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                We've sent a verification link to <strong>{email}</strong>. 
                Please click the link in your email to activate your account and log in.
              </p>
              <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg text-[10px] text-slate-450 text-left leading-normal mt-4">
                <strong>Testing Tip:</strong> If you are running locally or don't receive the email, you can find the verification link printed directly inside the <strong>backend server logs</strong>!
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-slate-900 hover:bg-black text-white rounded-lg py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                Go to Sign In
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
