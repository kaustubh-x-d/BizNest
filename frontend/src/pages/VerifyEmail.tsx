import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { api } from "../services/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    async function verify() {
      if (!token) {
        setError("Invalid verification link. Token is missing.");
        setLoading(false);
        return;
      }
      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        setSuccess(response.data.message || "Email verified successfully!");
      } catch (err: any) {
        setError(err.response?.data?.error || "Verification failed. The link may have expired or is invalid.");
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 space-y-6 text-center shadow-sm">
        {/* Head */}
        <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center font-extrabold text-white text-sm mx-auto shadow-sm">
          BN
        </div>

        {loading ? (
          <div className="space-y-4 py-6">
            <Loader2 className="w-10 h-10 animate-spin text-slate-700 mx-auto" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Verifying Email...</h2>
              <p className="text-xs text-slate-400 mt-1">Please wait while we confirm your credentials.</p>
            </div>
          </div>
        ) : error ? (
          <div className="space-y-4 py-4">
            <XCircle className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Verification Failed</h2>
              <p className="text-xs text-red-600 mt-2 bg-red-50 border border-red-100 p-3 rounded-lg leading-relaxed">{error}</p>
            </div>
            <div className="pt-2">
              <Link 
                to="/login" 
                className="inline-block bg-slate-900 hover:bg-black text-white px-6 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <div>
              <h2 className="text-base font-bold text-slate-900 font-sans tracking-tight">Account Verified!</h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{success}</p>
            </div>
            <div className="pt-2">
              <Link 
                to="/login" 
                className="inline-block bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                Sign In to BizNest
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
