import React, { useState, useEffect } from 'react';
import { getJobs } from '../services/jobsApi';
import { getApplications, createApplication } from '../services/applicationApi';
import { useAuth } from '../context/AuthContext';
import { JobCard } from '../components/JobCard';
import { Search, SlidersHorizontal, Briefcase, Filter, Sparkles, Layers } from 'lucide-react';

export const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkMode, setSelectedWorkMode] = useState('All');
  const [minMatchScore, setMinMatchScore] = useState(0);
  const [selectedExp, setSelectedExp] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getJobs({
        search: searchTerm,
        experience: selectedExp,
        work_mode: selectedWorkMode,
      });
      const jobsArray = data?.jobs || (Array.isArray(data) ? data : []);
      const appsData = await getApplications();
      setJobs(jobsArray);
      setApplications(appsData || []);
      } catch (err) {
        console.error('Error fetching jobs or applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isJobTracked = (jobId) => applications.some((app) => app.jobId === jobId || app.job_id === jobId);

  const handleTrackJob = async (job) => {
    try {
      await createApplication({
        job_id: job.id || job._id,
        status: 'Saved',
        notes: `Tracked from Jobs Explorer. Match score ${job.match_score || job.matchScore || 85}%`
      });
      // Refresh apps
      const updatedApps = await getApplications();
      setApplications(updatedApps);
    } catch (err) {
      console.error('Error tracking job:', err);
    }
  };

  // Filter jobs logic
  const filteredJobs = jobs.filter((job) => {
    const jobTitle = job.title || '';
    const jobCompany = job.company_name || job.company || '';
    const skillsString = job.skills || job.job_skills || '';
    const jobSkills = typeof skillsString === 'string' ? skillsString.split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(skillsString) ? skillsString : []);
    const jobMode = job.work_mode || job.workMode || 'Remote';
    const jobExp = job.experience_required || job.experience || 'Entry';
    const jobScore = job.match_score || job.matchScore || 85;

    const matchesSearch =
      jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobSkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesWorkMode =
      selectedWorkMode === 'All' || jobMode.toLowerCase() === selectedWorkMode.toLowerCase();

    const matchesScore = jobScore >= minMatchScore;

    const matchesExp =
      selectedExp === 'All' ||
      (selectedExp === 'Entry' && (jobExp.includes('1') || jobExp.includes('2') || jobExp.toLowerCase().includes('entry'))) ||
      (selectedExp === 'Mid' && (jobExp.includes('3') || jobExp.includes('4') || jobExp.includes('5') || jobExp.toLowerCase().includes('mid'))) ||
      (selectedExp === 'Senior' && (jobExp.includes('6') || jobExp.includes('7') || jobExp.includes('8') || jobExp.toLowerCase().includes('senior')));

    return matchesSearch && matchesWorkMode && matchesScore && matchesExp;
  });

  const userThreshold = user?.min_match_score || 70;

  if (loading) {
    return <div className="p-8 flex justify-center text-slate-500 font-semibold text-sm">Loading Job Scout Feed...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Search className="h-5 w-5 text-brand-700" /> Jobs Explorer & Scout Feed
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse scraped listings, evaluate match scores, and track applications directly
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMinMatchScore(userThreshold)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand-700" />
              <span>Apply Profile Threshold (≥{userThreshold}%)</span>
            </button>
            {minMatchScore > 0 && (
              <button
                onClick={() => setMinMatchScore(0)}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Reset Threshold
              </button>
            )}
          </div>
        </div>

        {/* Search Bar & Filter Controls Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-200">
          {/* Search Input */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, company, or skill..."
              className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700/20"
            />
          </div>

          {/* Work Mode Dropdown */}
          <div>
            <select
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700/20 cursor-pointer"
            >
              <option value="All">All Work Modes</option>
              <option value="Remote">Remote Only</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
          </div>

          {/* Experience Filter */}
          <div>
            <select
              value={selectedExp}
              onChange={(e) => setSelectedExp(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700/20 cursor-pointer"
            >
              <option value="All">All Experience Levels</option>
              <option value="Entry">Entry Level (1-3 Yrs)</option>
              <option value="Mid">Mid Level (3-5 Yrs)</option>
              <option value="Senior">Senior Level (6+ Yrs)</option>
            </select>
          </div>

          {/* Min Match Score Filter */}
          <div>
            <select
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(Number(e.target.value))}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700/20 cursor-pointer"
            >
              <option value={0}>Any Match Score</option>
              <option value={70}>Match Score ≥ 70%</option>
              <option value={80}>Match Score ≥ 80%</option>
              <option value={90}>Match Score ≥ 90%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Job Cards */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id || job._id}
              job={job}
              isTracked={isJobTracked(job.id || job._id)}
              onTrackJob={handleTrackJob}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <Layers className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching jobs found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms, work mode filters, or lowering the minimum match score threshold.
          </p>
        </div>
      )}
    </div>
  );
};

export default Jobs;
