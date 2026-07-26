import React, { useState } from 'react';
import { formatSalaryToLPA } from '../utils/formatters';
import { MapPin, Briefcase, ExternalLink, PlusCircle, CheckCircle2, Building, ChevronDown, ChevronUp } from 'lucide-react';

export const JobCard = ({ job, isTracked, onTrackJob }) => {
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const skillsString = job.skills || job.job_skills || '';
  const skillsList = typeof skillsString === 'string' ? skillsString.split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(skillsString) ? skillsString : []);
  
  // Maximum skills to display by default: 4
  const maxInitialSkills = 4;
  const hasMoreSkills = skillsList.length > maxInitialSkills;
  const visibleSkills = showAllSkills ? skillsList : skillsList.slice(0, maxInitialSkills);
  const remainingCount = skillsList.length - maxInitialSkills;

  return (
    <div className={`bg-white border hover:border-brand-300 rounded-xl p-5 shadow-sm transition-all duration-200 flex flex-col space-y-4 group ${isExpanded ? 'border-brand-200 ring-2 ring-brand-50' : 'border-slate-200'}`}>
      {/* Top Header: Company, Title, Match Score */}
      <div 
        className="cursor-pointer flex flex-col gap-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-brand-50 text-brand-700 rounded-lg border border-brand-100">
                <Building className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold text-slate-700">{job.company_name || job.company}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors leading-snug">
              {job.title}
            </h3>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-brand-50 text-brand-700 border border-brand-100 shadow-2xs">
              {job.match_score || job.matchScore || 85}% Match
            </span>
            <button className="text-slate-400 hover:text-brand-700 transition-colors p-1">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Metadata Details */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{job.experience_required || job.experience || 'Entry'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Salary:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              {formatSalaryToLPA(job.salary_max || job.salaryRaw)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Mode:</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
              {job.work_mode || job.workMode || 'Remote'}
            </span>
          </div>
          </div>

          {/* Skills Tags with Functional Toggle */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Required Skills:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {visibleSkills.map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200/60"
            >
              {skill}
            </span>
          ))}

          {/* Functional +X More Button Toggle */}
          {hasMoreSkills && (
            <button
              onClick={() => setShowAllSkills(!showAllSkills)}
              className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>{showAllSkills ? 'Show less' : `+${remainingCount} more`}</span>
              {showAllSkills ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          )}
        </div>
      </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center gap-2 border-t border-slate-100 mt-4">
            <a
              href={job.apply_url || job.applyUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              <span>Apply Link</span>
            </a>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onTrackJob(job);
              }}
              disabled={isTracked}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isTracked
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : 'bg-brand-700 hover:bg-brand-900 text-white shadow-md shadow-brand-700/20'
              }`}
            >
              {isTracked ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Tracked</span>
                </>
              ) : (
                <>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Track Job</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
