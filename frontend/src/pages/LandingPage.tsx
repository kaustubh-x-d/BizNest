import { Link, useNavigate } from "react-router-dom";
import { Compass, Sparkles, ArrowRight, BarChart2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function LandingPage() {
  const { loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleGuest = () => {
    loginAsGuest();
    navigate("/dashboard");
  };

  const features = [
    {
      title: "GIS Location Analysis",
      desc: "Retrieve and overlay competitor densities, transit links, and demographics indicators straight from OpenStreetMap layers.",
      icon: Compass,
      color: "text-slate-700 bg-slate-100"
    },
    {
      title: "Transparent Scoring Engine",
      desc: "Understand exactly how scores are derived. Built purely on open math metrics, weight matrices, and custom parameters.",
      icon: BarChart2,
      color: "text-slate-700 bg-slate-100"
    },
    {
      title: "Generative AI Explanations",
      desc: "Uses LLM models to contextually review locations, highlighting pros, cons, warning risks, and tactical suggestions.",
      icon: Sparkles,
      color: "text-slate-700 bg-slate-100"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between overflow-hidden relative font-sans">
      {/* Nav */}
      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center font-extrabold text-white text-sm">
            BN
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight text-base">BizNest</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
            Sign In
          </Link>
          <Link to="/signup" className="text-xs font-bold bg-slate-900 hover:bg-black px-4 py-2 rounded-lg text-white transition-all shadow-sm">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl w-full mx-auto px-6 py-16 md:py-24 space-y-24 z-10 flex-grow flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] uppercase tracking-wider text-slate-600 font-bold shadow-sm">
              <Sparkles className="w-3 h-3 text-slate-500" /> Platform Preview
            </span>
            
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Predict the potential <br />
              of business locations before you invest.
            </h1>
            
            <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
              BizNest evaluates location options using GIS layers, demographical amenities, accessibility data, and competition matrices to compute a transparent, data-backed <strong>Business Potential Score</strong> and customized recommendations.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleGuest}
                className="bg-slate-900 hover:bg-black text-white rounded-lg py-3 px-6 text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                Explore Map Explorer
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              
              <Link
                to="/signup"
                className="bg-white border border-slate-200 hover:bg-slate-50 px-6 py-3 rounded-lg text-slate-700 text-xs font-bold transition-all text-center"
              >
                Create Free Account
              </Link>
            </div>
          </div>

          {/* Graphical Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-md relative">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-slate-400">Scoring Engine Preview</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">Recommended</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">Business Potential Score</span>
                    <span className="text-3xl font-extrabold text-slate-900">87 / 100</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Type: Café | Budget: 15L</div>
                </div>
                {/* Math breakdown */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Market Demand</span>
                    <span>92</span>
                  </div>
                  <div className="flex-grow h-1.5 bg-slate-100 rounded overflow-hidden">
                    <div className="h-full bg-slate-900 rounded" style={{ width: "92%" }} />
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Competition Index</span>
                    <span>74</span>
                  </div>
                  <div className="flex-grow h-1.5 bg-slate-100 rounded overflow-hidden">
                    <div className="h-full bg-slate-900 rounded" style={{ width: "74%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features list section */}
        <div className="space-y-10 pt-8 border-t border-slate-200">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Standard Platform Capabilities</h2>
            <p className="text-xs text-slate-500">
              BizNest blends physical GIS coordinates mappings with transparent calculations logic.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm hover:border-slate-300 transition-all text-left">
                  <div className={`w-9 h-9 rounded-lg ${feat.color} flex items-center justify-center`}>
                    <Icon className="w-4.5 h-4.5 text-slate-800" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{feat.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 flex items-center justify-center border-t border-slate-200 bg-white text-[10px] text-slate-400">
        &copy; {new Date().getFullYear()} BizNest. Designed for Location Intelligence.
      </footer>
    </div>
  );
}
