import { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { User, Mail, Lock, CheckCircle, BadgeDollarSign } from "lucide-react";
import { api } from "../services/api";

export default function Profile() {
  const { user, setUser } = useAuth();
  
  const [fullName, setFullName] = useState<string>(user?.full_name || "");
  const [email, setEmail] = useState<string>(user?.email || "");
  const [budgetTier, setBudgetTier] = useState<string>(user?.budget_tier || "medium");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !fullName.trim()) {
      setError("Name and Email are required fields.");
      return;
    }

    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload: any = {
        email: email.trim(),
        full_name: fullName.trim(),
        budget_tier: budgetTier
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      const response = await api.put("/users/me", payload);
      
      // Update global context user details
      if (setUser) {
        setUser(response.data);
      }
      
      setSuccess("Profile details updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update profile. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12 font-sans max-w-2xl text-left">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-slate-700" />
            My Profile Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your account credentials, contact email, and default platform settings.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs py-2.5 px-4 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs py-2.5 px-4 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
              <p className="text-[10px] text-slate-400">Updating email requires a valid, non-temporary domain.</p>
            </div>

            {/* Budget Tier */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Default Budget Tier</label>
              <div className="relative">
                <select
                  value={budgetTier}
                  onChange={(e) => setBudgetTier(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg py-2.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="low">Low Budget (&lt; 5L)</option>
                  <option value="medium">Medium Budget (5L - 15L)</option>
                  <option value="high">High Budget (&gt; 15L)</option>
                </select>
                <BadgeDollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Change Password</h3>
              <p className="text-[10px] text-slate-400">Leave these blank if you do not wish to modify your password.</p>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white text-slate-900 placeholder-slate-300 border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white text-slate-900 placeholder-slate-300 border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg py-2.5 px-6 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? "Saving Changes..." : "Save Settings"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
