import React, { useCallback, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import GISMap from "../components/map/GISMap";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { 
  Coffee, 
  Cake, 
  Plus, 
  Dumbbell, 
  Store, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  Bookmark, 
  X,
  AlertCircle
} from "lucide-react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

type BusinessType = "cafe" | "bakery" | "pharmacy" | "gym" | "kirana";

interface ScoreData {
  overall_score: number;
  recommendation: string;
  brief: string;
  breakdown: {
    demand: number;
    competition: number;
    accessibility: number;
    feasibility: number;
  };
  stats: {
    competitor_count: number;
    demand_amenities_count: number;
    transit_nodes_count: number;
    parking_spots_count: number;
  };
  explanation?: {
    business_explanation: string;
    pros: string[];
    cons: string[];
    suggestions: string[];
  };
}

export default function Dashboard() {
  const { isGuest } = useAuth();
  const [businessType, setBusinessType] = useState<BusinessType>("cafe");
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number; radius: number } | null>(null);
  
  // Dashboard states
  const [loading, setLoading] = useState<boolean>(false);
  const [scoreResult, setScoreResult] = useState<ScoreData | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
  const [reportTitle, setReportTitle] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const businessTypes: { id: BusinessType; name: string; icon: any; color: string }[] = [
    { id: "cafe", name: "Café", icon: Coffee, color: "text-amber-600 bg-amber-50" },
    { id: "bakery", name: "Bakery", icon: Cake, color: "text-pink-600 bg-pink-50" },
    { id: "pharmacy", name: "Pharmacy", icon: Plus, color: "text-emerald-600 bg-emerald-50" },
    { id: "gym", name: "Gym", icon: Dumbbell, color: "text-cyan-600 bg-cyan-50" },
    { id: "kirana", name: "Kirana Store", icon: Store, color: "text-slate-700 bg-slate-100" }
  ];

  const [geofenceError, setGeofenceError] = useState<string>("");

  const handleLocationSelect = useCallback((lat: number, lon: number, radius: number) => {
    const minLat = 26.30, maxLat = 26.60;
    const minLon = 80.10, maxLon = 80.50;
    const isInside = lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;

    if (!isInside) {
      setGeofenceError("Selected location is outside Kanpur! BizNest currently only supports location intelligence within Kanpur bounds.");
      setSelectedLocation(null);
      setScoreResult(null);
    } else {
      setGeofenceError("");
      setSelectedLocation({ lat, lon, radius });
    }
  }, []);

  const handleCalculateScore = async () => {
    if (!selectedLocation) return;
    setLoading(true);
    setScoreResult(null);
    try {
      const response = await api.post("/analysis/score", {
        business_type: businessType,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lon,
        budget: businessType === "cafe" ? 1500000 : businessType === "kirana" ? 800000 : 1200000,
        radius: selectedLocation.radius
      });
      setScoreResult(response.data);
    } catch (err) {
      console.error("Error computing score details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation || !scoreResult || !reportTitle.trim() || isGuest) return;
    try {
      await api.post("/reports/", {
        title: reportTitle,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lon,
        business_type: businessType,
        budget: businessType === "cafe" ? 1500000 : 1000000,
        radius: selectedLocation.radius
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setSaveDialogOpen(false);
        setReportTitle("");
      }, 1500);
    } catch (err) {
      console.error("Error saving analytical report", err);
    }
  };

  // Format Recharts data mapping
  const chartData = scoreResult ? [
    { subject: "Demand", A: scoreResult.breakdown.demand, fullMark: 100 },
    { subject: "Competition", A: scoreResult.breakdown.competition, fullMark: 100 },
    { subject: "Accessibility", A: scoreResult.breakdown.accessibility, fullMark: 100 },
    { subject: "Feasibility", A: scoreResult.breakdown.feasibility, fullMark: 100 },
  ] : [];

  const statsChartData = scoreResult ? [
    { name: "Competitors", count: scoreResult.stats.competitor_count, fill: "#ef4444" },
    { name: "Demands", count: scoreResult.stats.demand_amenities_count, fill: "#2563eb" },
    { name: "Transits", count: scoreResult.stats.transit_nodes_count, fill: "#06b6d4" },
    { name: "Parkings", count: scoreResult.stats.parking_spots_count, fill: "#eab308" }
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Location Explorer</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Select business category and coordinates to run spatial evaluation algorithms.
            </p>
          </div>
        </div>

        {/* Business Selector Categories */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Step 1: Choose Business Category
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {businessTypes.map((item) => {
              const Icon = item.icon;
              const isSelected = businessType === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setBusinessType(item.id);
                    setScoreResult(null);
                  }}
                  className={`relative overflow-hidden rounded-lg p-4 border text-left transition-all ${
                    isSelected 
                      ? 'bg-slate-50 border-slate-900' 
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center mb-3 border border-slate-100`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-slate-900">{item.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* KPI Cards Grid */}
        {scoreResult && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Score */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Potential Score</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-slate-900">{scoreResult.overall_score}</span>
                <span className="text-slate-400 text-[10px]">/ 100</span>
              </div>
              <div className="text-[10px] text-slate-500 font-bold">Rating: {scoreResult.recommendation}</div>
            </div>

            {/* Card 2: Competitors */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Competition Density</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-slate-900">{scoreResult.stats.competitor_count}</span>
                <span className="text-slate-400 text-[10px]">outlets nearby</span>
              </div>
              <div className={`text-[10px] font-bold ${
                scoreResult.stats.competitor_count <= 3 ? 'text-emerald-600' :
                scoreResult.stats.competitor_count <= 7 ? 'text-amber-600' : 'text-red-650'
              }`}>
                {scoreResult.stats.competitor_count <= 3 ? 'Low Density Hotspot' :
                 scoreResult.stats.competitor_count <= 7 ? 'Moderate Competition' : 'High Competitor Saturation'}
              </div>
            </div>

            {/* Card 3: Accessibility */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Accessibility Rating</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-slate-900">{scoreResult.breakdown.accessibility}</span>
                <span className="text-slate-400 text-[10px]">/ 100</span>
              </div>
              <div className="text-[10px] text-slate-500 font-bold">
                {scoreResult.stats.transit_nodes_count} transits & {scoreResult.stats.parking_spots_count} parkings
              </div>
            </div>

            {/* Card 4: Feasibility */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Capital Feasibility</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-slate-900">{scoreResult.breakdown.feasibility}</span>
                <span className="text-slate-400 text-[10px]">/ 100</span>
              </div>
              <div className="text-[10px] text-slate-500 font-bold">
                {scoreResult.breakdown.feasibility >= 80 ? 'Optimal Funding Match' : 'Inadequate Capital Buffer'}
              </div>
            </div>
          </div>
        )}

        {/* Map and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map canvas */}
          <div className="lg:col-span-2 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Step 2: Define Geographic Range
            </span>
            <GISMap 
              businessType={businessType} 
              onLocationSelect={handleLocationSelect} 
            />
          </div>

          {/* Quick trigger action panel */}
          <div className="space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Step 3: Execute Assessment
              </span>
              <div className="bg-white border border-slate-200 rounded-xl p-5 h-[600px] flex flex-col justify-between shadow-sm">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Analysis Parameters</h3>
                  {selectedLocation ? (
                    <div className="space-y-2 font-mono text-[11px] text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div>Latitude: {selectedLocation.lat.toFixed(6)}</div>
                      <div>Longitude: {selectedLocation.lon.toFixed(6)}</div>
                      <div>Target Radius: {selectedLocation.radius} meters</div>
                    </div>
                  ) : geofenceError ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs py-3 px-4 rounded-lg leading-relaxed flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        {geofenceError}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Drop a pin on the map to display target parameters.</p>
                  )}
                </div>

                <button
                  disabled={!selectedLocation || loading}
                  onClick={handleCalculateScore}
                  className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Building2 className="w-4 h-4" />
                  {loading ? "Calculating..." : "Compute Potential Score"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        {scoreResult && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-2">
            {/* Score Dial & Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-450 block">Assessment Score Card</span>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="text-3xl font-bold text-slate-900">{scoreResult.overall_score}</div>
                  <span className="text-[9px] bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                    {scoreResult.recommendation}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{scoreResult.brief}</p>
              </div>

              {/* Radar visualization */}
              <div className="h-48 w-full flex items-center justify-center border-t border-slate-100 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" stroke="#6b7280" fontSize={9} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#d1d5db" fontSize={8} />
                    <Radar name="Score" dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* POI Proximity Bar Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-450 block">Density Analytics</span>
                <h3 className="text-xs font-bold text-slate-900 mt-1">POI Proximity counts</h3>
              </div>
              <div className="h-48 w-full flex items-center justify-center border-t border-slate-100 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsChartData} margin={{ top: 10, right: 10, left: -35, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={9} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb", borderRadius: "6px", fontSize: "10px", color: "#111827" }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Explanations */}
            {scoreResult.explanation && (
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-slate-700" />
                    <h3 className="text-sm font-bold text-slate-900">Analysis & Rationale</h3>
                  </div>
                  {!isGuest && (
                    <button
                      onClick={() => setSaveDialogOpen(true)}
                      className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      Save Snapshot
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-650 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                  {scoreResult.explanation.business_explanation}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] leading-relaxed">
                  <div className="space-y-2">
                    <h4 className="font-bold text-emerald-700 uppercase tracking-wider text-[9px]">Pros</h4>
                    <ul className="space-y-1 text-slate-550">
                      {scoreResult.explanation.pros.map((p, idx) => (
                        <li key={idx} className="flex gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-red-700 uppercase tracking-wider text-[9px]">Cons</h4>
                    <ul className="space-y-1 text-slate-550">
                      {scoreResult.explanation.cons.map((c, idx) => (
                        <li key={idx} className="flex gap-1.5">
                          <span className="text-red-500 font-bold">•</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[9px]">Strategic Suggestions</h4>
                    <ul className="space-y-1 text-slate-550">
                      {scoreResult.explanation.suggestions.map((s, idx) => (
                        <li key={idx} className="flex gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Save Dialog Modal */}
        {saveDialogOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-lg relative">
              <button 
                onClick={() => setSaveDialogOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm">Save Report</h3>
                <p className="text-xs text-slate-400">Enter a descriptive title for this analysis.</p>
              </div>

              {saveSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-xs text-emerald-800 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Report saved successfully!
                </div>
              ) : (
                <form onSubmit={handleSaveReport} className="space-y-4">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kakadeo Crossing Cafe Analysis"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-black text-white font-bold py-2 rounded-lg text-xs shadow-sm transition-colors"
                  >
                    Confirm Save
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
