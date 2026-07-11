import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { FolderHeart, RefreshCw, Trash2, Calendar, MapPin, Coffee, Cake, Plus, Dumbbell, Store } from "lucide-react";
import { api } from "../services/api";

interface SavedReport {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  business_type: string;
  budget: number;
  radius: number;
  created_at: string;
}

export default function SavedReports() {
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
    fetchReports();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this saved report?")) {
      try {
        await api.delete(`/reports/${id}`);
        setReports(reports.filter((r) => r.id !== id));
      } catch (err) {
        console.error("Failed to delete report record", err);
        alert("Failed to delete report. Please try again.");
      }
    }
  };

  const getBusinessIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "cafe": return Coffee;
      case "bakery": return Cake;
      case "pharmacy": return Plus;
      case "gym": return Dumbbell;
      default: return Store;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12 font-sans text-left">
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
            disabled={loading}
            onClick={fetchReports}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-slate-700" />
            <p className="text-xs">Loading saved reports...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-750 text-xs py-3 px-4 rounded-xl">
            {error}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl max-w-xl mx-auto space-y-3 shadow-sm">
            <FolderHeart className="w-12 h-12 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">No Saved Snapshots</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                You haven't saved any reports yet. Drop a pin on the map, run location calculations, and click <strong>Save Snapshot</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => {
              const IconComp = getBusinessIcon(report.business_type);
              return (
                <div key={report.id} className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between gap-4 shadow-sm hover:border-slate-300 transition-colors">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Location Dossier</span>
                        <h3 className="font-bold text-sm text-slate-900">{report.title}</h3>
                      </div>
                      <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700">
                        <IconComp className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-500 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1.5 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                    <div className="text-[10px] text-slate-500">
                      Target Area: <strong className="text-slate-900">{(report.radius / 1000).toFixed(1)} km</strong>
                    </div>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-2 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
