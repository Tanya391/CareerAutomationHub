import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Sliders, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, updateUserData } = useAuth();
  
  const [name, setName] = useState('');
  const [skillsKeywords, setSkillsKeywords] = useState('');
  const [minMatchScore, setMinMatchScore] = useState(70);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSkillsKeywords(user.skills_keywords || '');
      setMinMatchScore(user.min_match_score || 70);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !skillsKeywords) return setError('Full name and target skills are mandatory.');

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateUserData({
        name,
        skills_keywords: skillsKeywords,
        min_match_score: minMatchScore
      });
      setSuccess('Profile and preferences updated successfully!');
    } catch (err) {
      setError(err || 'Failed to update preferences.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-950 flex flex-col">
      <Navbar title="My Profile Settings" />
      
      <main className="flex-1 p-8 max-w-2xl w-full mx-auto space-y-6">
        
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Resume Scanner Settings</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">Tweak match keyword parameters and notification tolerances.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold p-3.5 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold p-3.5 rounded-lg">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name */}
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg text-xs focus:outline-none placeholder-slate-600 text-slate-200"
                  required
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-1.5 opacity-60">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Email Address (Read-only)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs cursor-not-allowed text-slate-400"
                />
              </div>
            </div>

            {/* Skills Keywords */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Match Skills (Comma separated)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Sliders className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={skillsKeywords}
                  onChange={(e) => setSkillsKeywords(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg text-xs focus:outline-none placeholder-slate-600 text-slate-200"
                  required
                />
              </div>
              <p className="text-[9px] text-slate-500 font-medium">Add, remove, or modify keywords (e.g. Node.js, Python, CSS) to tune match percentages on jobs.</p>
            </div>

            {/* Match score threshold slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Minimum matching alert score</label>
                <span className="text-xs font-bold text-brand-400">{minMatchScore}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
              <p className="text-[9px] text-slate-500 font-medium">Opportunities matching below this threshold will not dispatch email alerts.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Settings...
                </>
              ) : (
                'Save Settings'
              )}
            </button>

          </form>
        </div>

      </main>
    </div>
  );
};

export default Profile;
