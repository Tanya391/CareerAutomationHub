import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Kanban, 
  Terminal, 
  User, 
  LogOut, 
  Cpu, 
  Building2,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApplications } from '../services/applicationApi';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [trackedCount, setTrackedCount] = useState(0);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const apps = await getApplications();
        setTrackedCount(apps.length);
      } catch (e) {
        console.error(e);
      }
    };
    if (user) fetchApps();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { id: '/', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: '/jobs', label: 'All Jobs Explorer', icon: <Search className="h-4 w-4" /> },
    { id: '/tracker', label: 'Applications', icon: <Kanban className="h-4 w-4" />, badge: trackedCount },
    { id: '/companies', label: 'Target Portals', icon: <Building2 className="h-4 w-4" /> },
    { id: '/testing-lab', label: 'Testing Lab', icon: <Terminal className="h-4 w-4" /> },
    { id: '/logs', label: 'Scan Logs', icon: <FileText className="h-4 w-4" /> },
    { id: '/profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
  ];

  if (!user) return null;

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 shadow-sm z-40">
      {/* Brand & System Status */}
      <div className="p-5 border-b border-slate-200 flex flex-col gap-3">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-brand-700 flex items-center justify-center text-white shadow-sm shadow-brand-700/20 shrink-0">
            <Cpu className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm tracking-tight truncate">Career Hub</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full shrink-0">
                v2.4
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5 truncate">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="truncate">Heartbeat 120ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
        {navItems.map((item) => {
          const isActive = location.pathname === item.id;
          return (
            <Link
              key={item.id}
              to={item.id}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-50 text-brand-900 border border-brand-100/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-brand-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Actions */}
      <div className="p-4 border-t border-slate-200 space-y-3">
        <Link
          to="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all"
        >
          <div className="h-8 w-8 rounded-lg bg-brand-100 text-brand-900 font-bold flex items-center justify-center uppercase shrink-0">
            {user.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="overflow-hidden text-left">
            <p className="text-slate-900 text-xs font-bold leading-none truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 mt-1 truncate">Score ≥ {user.min_match_score || 70}%</p>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
