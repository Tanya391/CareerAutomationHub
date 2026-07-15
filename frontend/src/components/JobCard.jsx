import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  ExternalLink, 
  Bookmark, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const JobCard = ({ job, userSkillsString, trackedStatus, onTrackJob }) => {
  const [showAssessment, setShowAssessment] = useState(false);

  // Compute Client-side Match Score for visual wow-factor
  const getMatchData = () => {
    if (!userSkillsString) return { score: 0, matched: [], missing: [] };
    
    const userSkills = userSkillsString
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0);

    if (userSkills.length === 0) return { score: 0, matched: [], missing: [] };

    const searchText = `${job.title || ''} ${job.skills || ''} ${job.description || ''}`.toLowerCase();
    
    const matched = [];
    const missing = [];

    userSkills.forEach(skill => {
      const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b|${escaped}`, 'i');
      if (regex.test(searchText)) {
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    });

    const score = Math.round((matched.length / userSkills.length) * 100);
    return { score, matched, missing };
  };

  const { score, matched, missing } = getMatchData();

  // Helper for match score color badge
  const getScoreColor = (val) => {
    if (val >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (val >= 70) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  };

  const getWorkModeColor = (mode) => {
    if (mode === 'Remote') return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
    if (mode === 'Hybrid') return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  };

  // Convert comma-separated skills to array tags
  const skillsArray = job.skills
    ? job.skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
    : [];

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 hover:border-slate-700/60 transition-all duration-300 relative flex flex-col justify-between group">
      
      {/* Header */}
      <div>
        <div className="flex justify-between items-start gap-4">
          <div>
            <h4 className="text-base font-bold text-slate-100 group-hover:text-brand-400 transition-colors line-clamp-1">{job.title}</h4>
            <div className="flex items-center gap-1.5 mt-1 text-slate-400 text-sm font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>{job.company_name || job.source}</span>
            </div>
          </div>
          
          {/* Match Score Indicator */}
          {userSkillsString && (
            <div className="relative">
              <button
                onMouseEnter={() => setShowAssessment(true)}
                onMouseLeave={() => setShowAssessment(false)}
                onClick={() => setShowAssessment(!showAssessment)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getScoreColor(score)} cursor-help`}
              >
                <span>{score}% Match</span>
                <HelpCircle className="w-3 h-3" />
              </button>
              
              {/* Tooltip detail panel */}
              {showAssessment && (
                <div className="absolute right-0 top-7 w-60 bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-xl z-20 text-xs text-slate-300">
                  <h5 className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-2">Resume Matching Summary</h5>
                  <p className="mb-2 text-[10px] text-slate-400">Comparing requirements to your profile skill keywords.</p>
                  
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {matched.length > 0 && (
                      <div>
                        <span className="font-semibold text-emerald-400 block">Matched Skills:</span>
                        <p className="text-[10px] truncate capitalize">{matched.join(', ')}</p>
                      </div>
                    )}
                    {missing.length > 0 && (
                      <div className="mt-1.5">
                        <span className="font-semibold text-rose-400 block">Missing Skills:</span>
                        <p className="text-[10px] truncate capitalize">{missing.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-y-2 mt-4 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            <span>{job.experience || 'Fresher'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-500" />
            <span>{job.salary || 'Not disclosed'}</span>
          </div>
          <div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getWorkModeColor(job.work_mode)}`}>
              {job.work_mode}
            </span>
          </div>
        </div>

        {/* Skills Tag Section */}
        {skillsArray.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {skillsArray.slice(0, 4).map(skill => (
              <span key={skill} className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded">
                {skill}
              </span>
            ))}
            {skillsArray.length > 4 && (
              <span className="text-[10px] text-slate-500 font-bold self-center">
                +{skillsArray.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex gap-2.5 mt-6 border-t border-slate-800/60 pt-4">
        {/* External Apply Link */}
        <a
          href={job.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700/60 hover:bg-slate-800/50 text-slate-200 text-xs font-bold py-2 rounded-lg transition-all"
        >
          Apply Portal
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Tracker Action Button */}
        {trackedStatus ? (
          <div className="flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold rounded-lg select-none">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{trackedStatus}</span>
          </div>
        ) : (
          <button
            onClick={() => onTrackJob(job.id)}
            className="flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all shadow-md shadow-brand-600/10"
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            Track
          </button>
        )}
      </div>

    </div>
  );
};

export default JobCard;
