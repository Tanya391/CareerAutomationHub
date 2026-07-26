import React, { useState } from 'react';
import { Mail, Lock, LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both Email and Password fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-700/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-400/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-white/60 backdrop-blur-md border border-slate-200/80 p-8 rounded-2xl shadow-xl shadow-slate-200/50 relative z-10">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 mb-3 shadow-xs">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-brand-950">
            Career Automation Hub
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to access your automated job scouting engine & tracker
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg p-3 font-semibold">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20 text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20 text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-slate-300 text-brand-700 focus:ring-brand-700/50"
              />
              <span>Remember this session</span>
            </label>
            <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-brand-700 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-700 hover:bg-brand-900 text-white text-sm font-bold rounded-lg shadow-md shadow-brand-700/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">Authenticating...</span>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign In to Automation Hub
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 text-center">
          <p className="text-sm font-medium text-slate-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-brand-700 hover:text-brand-900 cursor-pointer underline"
            >
              Register details
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 pt-2 uppercase tracking-wider">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>256-bit Encrypted Session • Scraper Engine Ready</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
