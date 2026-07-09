import React, { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { api } from "../services/api";
import {
  ArrowLeftRight, 
  MapPin, 
  Award
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface CompareDetails {
  business_type: string;
  budget: number;
  winner: string;
  reason: string;
  location_a: {
    label: string;
    lat: number;
    lon: number;
    details: {
      overall_score: number;
      recommendation: string;
      brief: string;
      breakdown: {
        demand: number;
        competition: number;
        accessibility: number;
        feasibility: number;
      };
      explanation?: {
        business_explanation: string;
        pros: string[];
        cons: string[];
        suggestions: string[];
      };
    }
  };
  location_b: {
    label: string;
    lat: number;
    lon: number;
    details: {
      overall_score: number;
      recommendation: string;
      brief: string;
      breakdown: {
        demand: number;
        competition: number;
        accessibility: number;
        feasibility: number;
      };
      explanation?: {
        business_explanation: string;
        pros: string[];
        cons: string[];
        suggestions: string[];
      };
    }
  };
}

export default function ComparisonView() {
  const [businessType, setBusinessType] = useState<string>("cafe");
  
  // Locations inputs state
  const [labelA, setLabelA] = useState<string>("Kakadeo Crossing");
  const [latA, setLatA] = useState<number>(26.4499);
  const [lonA, setLonA] = useState<number>(80.3319);

  const [labelB, setLabelB] = useState<string>("Civil Lines Mall");
  const [latB, setLatB] = useState<number>(26.4880);
  const [lonB, setLonB] = useState<number>(80.3120);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CompareDetails | null>(null);
  const [error, setError] = useState<string>("");

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Geofence bounds checking
    const minLat = 26.30, maxLat = 26.60;
    const minLon = 80.10, maxLon = 80.50;
    const isInsideA = latA >= minLat && latA <= maxLat && lonA >= minLon && lonA <= maxLon;
    const isInsideB = latB >= minLat && latB <= maxLat && lonB >= minLon && lonB <= maxLon;

    if (!isInsideA) {
      setError(`Location A (${labelA}) coordinates are outside Kanpur bounds! Please input values between Latitude: 26.30 to 26.60 and Longitude: 80.10 to 80.50.`);
      return;
    }
    if (!isInsideB) {
      setError(`Location B (${labelB}) coordinates are outside Kanpur bounds! Please input values between Latitude: 26.30 to 26.60 and Longitude: 80.10 to 80.50.`);
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);
    try {
      const response = await api.post("/analysis/compare", {
        business_type: businessType,
        budget: businessType === "cafe" ? 1500000 : 1000000,
        location_a: { lat: latA, lon: lonA, label: labelA },
        location_b: { lat: latB, lon: lonB, label: labelB }
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error running side-by-side comparison. Please check your coordinates.");
      console.error("Error running side-by-side comparison", err);
    } finally {
      setLoading(false);
    }
  };

  // Compile data for Recharts side-by-side Bar chart
  const barChartData = result ? [
    {
      name: "Overall",
      [result.location_a.label]: result.location_a.details.overall_score,
      [result.location_b.label]: result.location_b.details.overall_score,
    },
    {
      name: "Demand",
      [result.location_a.label]: result.location_a.details.breakdown.demand,
      [result.location_b.label]: result.location_b.details.breakdown.demand,
    },
    {
      name: "Competition",
      [result.location_a.label]: result.location_a.details.breakdown.competition,
      [result.location_b.label]: result.location_b.details.breakdown.competition,
    },
    {
      name: "Accessibility",
      [result.location_a.label]: result.location_a.details.breakdown.accessibility,
      [result.location_b.label]: result.location_b.details.breakdown.accessibility,
    },
    {
      name: "Feasibility",
      [result.location_a.label]: result.location_a.details.breakdown.feasibility,
      [result.location_b.label]: result.location_b.details.breakdown.feasibility,
    },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12 font-sans">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-slate-700" />
            Location Matcher
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Input coordinate parameters for two locations to mathematically evaluate the better choice.
          </p>
        </div>

        <form onSubmit={handleCompare} className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-sm">
          {/* User Helper Tip */}
          <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-lg text-xs text-slate-600 flex items-start gap-2.5 leading-relaxed">
            <span className="text-slate-900 bg-slate-200 px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase">Tip</span>
            <div>
              Need coordinates? First, search or drop a pin on the map in the <strong>Map Explorer</strong> section. You can copy the exact <strong>latitude</strong> and <strong>longitude</strong> shown at the bottom of the map control panel and paste them below.
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs py-2.5 px-4 rounded-lg flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business Category</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                <option value="cafe">Café (Target: ₹15L)</option>
                <option value="bakery">Bakery (Target: ₹10L)</option>
                <option value="pharmacy">Pharmacy (Target: ₹12L)</option>
                <option value="gym">Gym (Target: ₹20L)</option>
                <option value="kirana">Kirana Store (Target: ₹8L)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-5">
            {/* Location A */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                Location A Parameters
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Area Label</span>
                  <input
                    type="text"
                    required
                    value={labelA}
                    onChange={(e) => setLabelA(e.target.value)}
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Latitude</span>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={latA}
                    onChange={(e) => setLatA(parseFloat(e.target.value))}
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Longitude</span>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={lonA}
                    onChange={(e) => setLonA(parseFloat(e.target.value))}
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Location B */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-750 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                Location B Parameters
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Area Label</span>
                  <input
                    type="text"
                    required
                    value={labelB}
                    onChange={(e) => setLabelB(e.target.value)}
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Latitude</span>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={latB}
                    onChange={(e) => setLatB(parseFloat(e.target.value))}
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Longitude</span>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={lonB}
                    onChange={(e) => setLonB(parseFloat(e.target.value))}
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <ArrowLeftRight className="w-4 h-4" />
            {loading ? "Analyzing..." : "Compare Locations"}
          </button>
        </form>

        {/* Results Comparison dashboard */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Winner Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row items-center gap-4 shadow-sm relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1 text-center md:text-left flex-1">
                <h3 className="text-sm font-bold text-slate-900">Winner: {result.winner}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{result.reason}</p>
              </div>
            </div>

            {/* Metrics side-by-side Bar chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Metrics Comparison</span>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 20, right: 30, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} />
                    <YAxis stroke="#6b7280" domain={[0, 100]} fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb", borderRadius: "6px", fontSize: "10px", color: "#111827" }} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Bar dataKey={result.location_a.label} fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={result.location_b.label} fill="#475569" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Side-by-side detailed cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
              {/* Location A */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-900">{result.location_a.label}</h3>
                  <div className="text-lg font-bold text-slate-800">{result.location_a.details.overall_score} <span className="text-[10px] text-slate-400">/ 100</span></div>
                </div>
                <div className="space-y-3 text-xs leading-relaxed text-slate-650">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-600">
                    {result.location_a.details.brief}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px] text-center font-bold text-slate-700">
                    <div className="bg-slate-50 border border-slate-150 p-2 rounded">
                      <div>{result.location_a.details.breakdown.demand}</div>
                      <div className="text-[8px] text-slate-400 uppercase mt-0.5">Demand</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-150 p-2 rounded">
                      <div>{result.location_a.details.breakdown.competition}</div>
                      <div className="text-[8px] text-slate-400 uppercase mt-0.5">Compet.</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-150 p-2 rounded">
                      <div>{result.location_a.details.breakdown.accessibility}</div>
                      <div className="text-[8px] text-slate-400 uppercase mt-0.5">Access</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-150 p-2 rounded">
                      <div>{result.location_a.details.breakdown.feasibility}</div>
                      <div className="text-[8px] text-slate-400 uppercase mt-0.5">Feasib.</div>
                    </div>
                  </div>
                  {result.location_a.details.explanation && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">Pros & Cons</div>
                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        <div>
                          <div className="font-bold text-emerald-700">Pros</div>
                          <ul className="list-disc list-inside text-slate-500 mt-1 space-y-1">
                            {result.location_a.details.explanation.pros.slice(0, 2).map((p: string, i: number) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="font-bold text-red-700">Cons</div>
                          <ul className="list-disc list-inside text-slate-500 mt-1 space-y-1">
                            {result.location_a.details.explanation.cons.slice(0, 2).map((c: string, i: number) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location B */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-900">{result.location_b.label}</h3>
                  <div className="text-lg font-bold text-slate-800">{result.location_b.details.overall_score} <span className="text-[10px] text-slate-400">/ 100</span></div>
                </div>
                <div className="space-y-3 text-xs leading-relaxed text-slate-650">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-600">
                    {result.location_b.details.brief}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px] text-center font-bold text-slate-700">
                    <div className="bg-slate-50 border border-slate-150 p-2 rounded">
                      <div>{result.location_b.details.breakdown.demand}</div>
                      <div className="text-[8px] text-slate-400 uppercase mt-0.5">Demand</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-150 p-2 rounded">
                      <div>{result.location_b.details.breakdown.competition}</div>
                      <div className="text-[8px] text-slate-400 uppercase mt-0.5">Compet.</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-150 p-2 rounded">
                      <div>{result.location_b.details.breakdown.accessibility}</div>
                      <div className="text-[8px] text-slate-400 uppercase mt-0.5">Access</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-150 p-2 rounded">
                      <div>{result.location_b.details.breakdown.feasibility}</div>
                      <div className="text-[8px] text-slate-400 uppercase mt-0.5">Feasib.</div>
                    </div>
                  </div>
                  {result.location_b.details.explanation && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">Pros & Cons</div>
                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        <div>
                          <div className="font-bold text-emerald-700">Pros</div>
                          <ul className="list-disc list-inside text-slate-500 mt-1 space-y-1">
                            {result.location_b.details.explanation.pros.slice(0, 2).map((p: string, i: number) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="font-bold text-red-700">Cons</div>
                          <ul className="list-disc list-inside text-slate-500 mt-1 space-y-1">
                            {result.location_b.details.explanation.cons.slice(0, 2).map((c: string, i: number) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
