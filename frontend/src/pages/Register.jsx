import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, KeyRound, Sliders, AlertCircle, Loader2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [skillsKeywords, setSkillsKeywords] = useState('React, Node.js, MySQL');
  const [minMatchScore, setMinMatchScore] = useState(70);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !skillsKeywords) {
      return setError('All fields marked as required are mandatory.');
    }

    setError('');
    setLoading(true);
    try {
      await register(name, email, password, skillsKeywords, minMatchScore);
      navigate('/');
    } catch (err) {
      setError(err || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden py-10">
      
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 backdrop-blur-md p-8 rounded-2xl shadow-xl shadow-black/40 relative z-10">
        
        {/* Branding Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/20 mx-auto mb-3">
            CH
          </div>
          <h2 className="text-2xl font-black text-slate-100">Create Account</h2>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">Configure your target skills for resume-matching alerts</p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold p-3.5 rounded-lg mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-all placeholder-slate-600 text-slate-200"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-all placeholder-slate-600 text-slate-200"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-all placeholder-slate-600 text-slate-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skills Keywords (Comma separated)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Sliders className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={skillsKeywords}
                onChange={(e) => setSkillsKeywords(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-all placeholder-slate-600 text-slate-200"
                placeholder="e.g. React, Node.js, MySQL, Python"
              />
            </div>
            <p className="text-[9px] text-slate-500 mt-1 font-medium">We will search job titles and descriptions for these terms to calculate match score.</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min match score threshold</label>
              <span className="text-xs font-bold text-brand-400">{minMatchScore}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <p className="text-[9px] text-slate-500 mt-0.5 font-medium">Jobs matching below this score will not send email notifications.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm rounded-lg transition-all shadow-md shadow-brand-600/10 hover:shadow-brand-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Register Account'
            )}
          </button>
        </form>

        <div className="text-center mt-6 border-t border-slate-800/80 pt-6">
          <p className="text-slate-400 text-xs font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-bold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
