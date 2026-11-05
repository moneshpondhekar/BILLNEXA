import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/common/Logo';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      const isAdm = email.toLowerCase().includes('admin');
      navigate(isAdm ? '/admin/dashboard' : '/employee/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPw: string) => {
    setEmail(demoEmail);
    setPassword(demoPw);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8">
        {/* Branding */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo size="lg" />
          </div>
          <p className="text-xs text-slate-500 font-medium">
            AI-Powered Document Processing & Claims Automation
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        {/* Demo Credentials Quick-Select Section */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-blue-600" />
            Quick Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@gmail.com', 'Admin@123')}
              className="p-2 border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 rounded-lg text-left transition"
            >
              <div className="font-bold text-xs text-blue-900">Admin</div>
              <div className="text-[10px] text-blue-700 truncate">admin@gmail.com</div>
              <div className="text-[9px] text-blue-500 font-mono mt-0.5">Admin@123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('Monesh@gmail.com', 'Monesh@123')}
              className="p-2 border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 rounded-lg text-left transition"
            >
              <div className="font-bold text-xs text-indigo-900">Monesh</div>
              <div className="text-[10px] text-indigo-700 truncate">Monesh@gmail.com</div>
              <div className="text-[9px] text-indigo-500 font-mono mt-0.5">Monesh@123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('Chetan@gmail.com', 'Chetan@123')}
              className="p-2 border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 rounded-lg text-left transition"
            >
              <div className="font-bold text-xs text-emerald-900">Chetan</div>
              <div className="text-[10px] text-emerald-700 truncate">Chetan@gmail.com</div>
              <div className="text-[9px] text-emerald-500 font-mono mt-0.5">Chetan@123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

