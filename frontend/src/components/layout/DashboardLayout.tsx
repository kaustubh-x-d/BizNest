import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight, 
  FolderHeart, 
  LogOut, 
  User, 
  Compass 
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isGuest } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Map Explorer", path: "/dashboard", icon: Compass },
    { name: "Compare Locations", path: "/compare", icon: ArrowLeftRight },
    { name: "Saved Reports", path: "/reports", icon: FolderHeart },
    { name: "My Profile", path: "/profile", icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center font-extrabold text-white text-sm">
              BN
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight block leading-none text-base">BizNest</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 block">Decision Hub</span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    isActive 
                      ? "bg-slate-100 border-l-2 border-slate-900 text-slate-900" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="space-y-4 pt-6 border-t border-slate-150">
          {isGuest && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-[10px] text-amber-700 leading-snug">
              Logged in as Guest. Saved reports will be local-only.
            </div>
          )}
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="font-bold text-xs text-slate-900 truncate">{user?.full_name}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 text-slate-600 rounded-lg py-2 text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
