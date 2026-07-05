import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { 
  FolderHeart, 
  Download, 
  Trash2, 
  Calendar, 
  MapPin, 
  RefreshCw,
  ShoppingBag
} from "lucide-react";

interface SavedReport {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  business_type: string;
  budget: number;
  score_breakdown: {
    demand: number;
    competition: number;
    accessibility: number;
    feasibility: number;
  };
  recommendations: {
    business_explanation: string;
    pros: string[];
    cons: string[];
    suggestions: string[];
  };
  created_at: string;
}

export default function SavedReports() {
  const { isGuest } = useAuth();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/reports/");
      setReports(response.data);
    } catch (err) {
      console.error("Error loading saved reports list", err);
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isGuest) {
      fetchReports();
    } else {
      setLoading(false);
    }
  }, [isGuest]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this saved report?")) {
      try {
        await api.delete(`/reports/${id}`);
        setReports(reports.filter((r) => r.id !== id));
      } catch (err) {
        console.error("Failed to delete report snapshot", err);
      }
    }
  };

  const handleDownload = async (id: string, title: string) => {
    try {
      const response = await api.get(`/reports/${id}/download`, {
        responseType: "blob",
      });
      // Create local file blob link to trigger standard browser download file behavior
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `BizNest_Report_${title.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading report", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FolderHeart className="w-5 h-5 text-slate-700" />
              Saved Analysis Reports
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              View, delete, or download analytical report dossiers for your targets.
            </p>
          </div>
          <button 
            disabled={loading || isGuest}
            onClick={fetchReports}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isGuest ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl max-w-xl mx-auto space-y-4 shadow-sm">
            <FolderHeart className="w-12 h-12 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Guest Mode Active</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Create a free account or log in to persist evaluation snapshots and download detailed data reports.
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-20 text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-slate-700" />
            <p className="text-xs">Loading saved reports...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600 text-xs">{error}</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl max-w-xl mx-auto space-y-4 shadow-sm">
            <FolderHeart className="w-12 h-12 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">No Reports Saved Yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Navigate to Map Explorer, compute score analysis, and click "Save Snapshot" to store evaluations.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {reports.map((report) => (
              <div 
                key={report.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 flex flex-col justify-between shadow-sm transition-all"
              >
                <div className="space-y-3">
                  {/* Top line */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-slate-900 text-sm tracking-tight leading-snug">{report.title}</h3>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          {report.business_type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lat/Lon */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <MapPin className="w-3 h-3 text-slate-450" />
                    ({report.latitude.toFixed(4)}, {report.longitude.toFixed(4)})
                  </div>

                  {/* Summary recommendations snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-3 rounded-lg border border-slate-150">
                    {report.recommendations.business_explanation}
                  </p>
                </div>

                {/* Actions bottom line */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                  <button
                    onClick={() => handleDownload(report.id, report.title)}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download dossier
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="p-2 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
