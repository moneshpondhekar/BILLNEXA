import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from './Logo';
import { 
  Menu, Bell, HelpCircle, LogOut, User, ChevronDown, CheckCircle, 
  FolderDown, UserCheck, FileEdit, Search, FileSpreadsheet, ShieldAlert,
  Database, Info, X, ExternalLink, Copy, Check
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout, switchDemoUser, isSupabaseConnected } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  // Navigation items matching MedPro Bills structure
  const navItems = isAdmin ? [
    { label: 'Home', path: '/admin/dashboard' },
    { label: 'Folder Dump', path: '/admin/upload' },
    { label: 'Folder Management', path: '/admin/folders' },
    { label: 'Assignment', path: '/admin/assignments' },
    { label: 'Claims Overview', path: '/admin/claims' },
    { label: 'Search & Tracking', path: '/admin/search' },
    { label: 'Activity Log', path: '/admin/activity' },
  ] : [
    { label: 'Home', path: '/employee/dashboard' },
    { label: 'My Assigned Documents', path: '/employee/tasks' },
    { label: 'Saved Claims', path: '/employee/claims' },
    { label: 'Search & Tracking', path: '/employee/search' },
    { label: 'My Activity', path: '/employee/activity' },
  ];

  const envTemplate = `# Paste these into frontend/.env and .env:
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-publishable-key"
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_KEY="your-anon-publishable-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret-key"`;

  const copyTemplate = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 select-none shadow-sm">
        {/* Top Utility Strip with MedPro navigation & Demo Switcher */}
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left: Logo & Nav items */}
          <div className="flex items-center space-x-6">
            <Link to={isAdmin ? '/admin/dashboard' : '/employee/dashboard'} className="flex items-center">
              <Logo size="md" />
            </Link>

            <nav className="hidden xl:flex items-center space-x-1">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side: Supabase Status + Demo Account Switcher + User Profile */}
          <div className="flex items-center space-x-3">
            {/* Supabase Status Pill */}
            <button
              onClick={() => setShowConfigModal(true)}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                isSupabaseConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
              title="Click to view database connection details"
            >
              <Database size={12} className={isSupabaseConnected ? 'text-emerald-600' : 'text-amber-600'} />
              <span>{isSupabaseConnected ? 'Supabase Live' : 'Local Mode'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </button>

            {/* Demo User Switcher Badge */}
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-600 px-2">Demo Role:</span>
              <button
                onClick={() => switchDemoUser('admin')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                  user?.email?.toLowerCase().includes('admin')
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => switchDemoUser('monesh')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                  user?.email?.toLowerCase().includes('monesh')
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monesh
              </button>
              <button
                onClick={() => switchDemoUser('chetan')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                  user?.email?.toLowerCase().includes('chetan')
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chetan
              </button>
            </div>

            {/* Notifications icon */}
            <div className="relative p-1.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                15
              </span>
            </div>

            {/* Help icon */}
            <div 
              onClick={() => setShowConfigModal(true)}
              className="p-1.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer hidden sm:block"
              title="Supabase setup instructions"
            >
              <HelpCircle size={18} />
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 pl-2 pr-1 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">
                    {user?.full_name || 'User'}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-600">
                    {user?.role}
                  </span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-800">{user?.full_name}</p>
                    <p className="text-slate-600">{user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px] uppercase">
                        Role: {user?.role}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        isSupabaseConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {isSupabaseConnected ? 'Supabase' : 'Local DB'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowConfigModal(true);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                  >
                    <Database size={14} className="text-blue-600" />
                    Supabase Configuration
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Supabase Connection Details Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isSupabaseConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  <Database size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Supabase Integration Status</h3>
                  <p className="text-xs text-slate-500">Bill Nexa Database, Storage & Authentication</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className={`p-3.5 rounded-lg border text-xs flex items-start gap-3 ${
              isSupabaseConnected 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <Info size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {isSupabaseConnected 
                    ? 'Connected to live Supabase project' 
                    : 'Running in Local Demonstration Mode'}
                </p>
                <p className="mt-1 leading-relaxed text-[11px]">
                  {isSupabaseConnected
                    ? 'All user authentication, document storage, and claims are synchronizing directly with your Supabase PostgreSQL and Storage buckets.'
                    : 'Supabase credentials are not currently configured in .env. The system is operating seamlessly with the built-in local backend and SQLite storage so you can test all workflows immediately.'}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Environment Variables Setup (.env):</label>
                <button
                  onClick={copyTemplate}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                >
                  {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  {copied ? 'Copied to clipboard!' : 'Copy template'}
                </button>
              </div>
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-[11px] font-mono overflow-x-auto leading-relaxed">
                {envTemplate}
              </pre>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p className="font-bold text-slate-800">Quick 3-Step Setup Instructions:</p>
              <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                <li>Create a free project at <span className="font-semibold text-blue-600">supabase.com</span>.</li>
                <li>Open the SQL Editor and paste <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">supabase/setup_complete_billnexa.sql</code>, then click <strong>Run</strong>.</li>
                <li>Add your <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">VITE_SUPABASE_URL</code> and <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">VITE_SUPABASE_ANON_KEY</code> to <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">.env</code> and <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">frontend/.env</code>.</li>
              </ol>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
