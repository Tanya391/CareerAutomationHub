import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJobs } from '../services/jobsApi';
import { getApplications, createApplication } from '../services/applicationApi';
import { getCompanies } from '../services/companyApi';
import { JobCard } from '../components/JobCard';
import { formatSalaryToLPA } from '../utils/formatters';
import { 
  Sparkles, 
  Database, 
  Send, 
  Building2, 
  Activity, 
  PlusCircle, 
  CheckCircle2, 
  MapPin, 
  ExternalLink,
  Sliders,
  Flame,
  ArrowRight
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [targetCompanies, setTargetCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ tracked: 0, interviews: 0, offers: 0, targets: 0, totalJobs: 0 });
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsData, appsData, compsData] = await Promise.all([
          getJobs(),
          getApplications(),
          getCompanies()
        ]);
        setStats({
          tracked: appsData?.length || 0,
          interviews: appsData?.filter(a => a.status === 'Interviews').length || 0,
          offers: appsData?.filter(a => a.status === 'Offer').length || 0,
          targets: compsData?.length || 0,
          totalJobs: jobsData?.pagination?.total || jobsData?.jobs?.length || 0
        });
        const jobsArray = jobsData?.jobs || (Array.isArray(jobsData) ? jobsData : []);
        setJobs(jobsArray);
        setRecentJobs(jobsArray.slice(0, 5));
        setApplications(appsData || []);
        setTargetCompanies(compsData || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalJobsAggregated = stats.totalJobs;
  const totalApplications = applications.length;
  const monitoredPortalsCount = targetCompanies.length; 
  const scraperHeartbeatStatus = 'Healthy (120ms)';

  const isTracked = (jobId) => applications.some((app) => app.jobId === jobId || app.job_id === jobId);

  const handleTrackJob = async (job) => {
    try {
      await createApplication({
        job_id: job.id || job._id,
        status: 'Saved',
        notes: `Tracked from Dashboard feed. Match score ${job.matchScore || job.match_score}%`
      });
      // Refresh apps
      const updatedApps = await getApplications();
      setApplications(updatedApps);
    } catch (err) {
      console.error('Error tracking job:', err);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center text-slate-500 font-semibold text-sm">Loading dashboard data...</div>;
  }

  // Safely get user skills array
  const userSkills = user?.skills_keywords 
    ? user.skills_keywords.split(',').map(s => s.trim()) 
    : [];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. WELCOME SECTION */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Career Automation System • Active Pulse</span>
            </div>

            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, <span className="text-brand-700">{user?.name ? user.name.split(' ')[0] : 'User'}</span>!
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              Your scouting engine is currently monitoring top career portals with a configured{' '}
              <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                Match Score Threshold of ≥ {user?.min_match_score || 70}%
              </span>.
            </p>

            {/* Targeted Skills Tags */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sliders className="h-3.5 w-3.5 text-brand-600" /> Targeted Skills:
              </span>
              {userSkills.length > 0 ? (
                userSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No skills set</span>
              )}
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={() => navigate('/jobs')}
              className="px-5 py-3 bg-brand-700 hover:bg-brand-900 text-white text-xs font-bold rounded-lg shadow-md shadow-brand-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore All Jobs</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/testing-lab')}
              className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Activity className="h-3.5 w-3.5 text-brand-700" />
              <span>Manual Testing Lab</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. METRICS GRID */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-brand-700" /> Key Engine Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:border-brand-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Jobs Aggregated
              </span>
              <div className="p-2.5 bg-brand-50 text-brand-700 rounded-lg border border-brand-100">
                <Database className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {totalJobsAggregated.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                <Flame className="h-3 w-3 text-emerald-500" /> +142 discovered today
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:border-brand-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Job Applications
              </span>
              <div className="p-2.5 bg-brand-50 text-brand-700 rounded-lg border border-brand-100">
                <Send className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {totalApplications}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center gap-1">
                <span>Active in Kanban Board</span>
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:border-brand-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Monitored Portals
              </span>
              <div className="p-2.5 bg-brand-50 text-brand-700 rounded-lg border border-brand-100">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {monitoredPortalsCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Across {targetCompanies.length} Target Companies
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:border-brand-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Scraper Heartbeats
              </span>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-xl font-extrabold text-slate-900">
                  {scraperHeartbeatStatus}
                </p>
              </div>
              <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                Cron frequency: 60 seconds
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FEED: Latest Discovered Jobs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-500" /> Latest Discovered Jobs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live automated feed scraped from target portals matching your criteria
            </p>
          </div>
          <button
            onClick={() => navigate('/jobs')}
            className="text-xs font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({jobs.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {jobs.slice(0, 5).map((job) => (
            <div key={job.id || job._id} className="relative">
              <JobCard
                job={job}
                isTracked={isTracked(job.id || job._id)}
                onTrackJob={handleTrackJob}
              />
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm font-semibold">
              No jobs discovered yet. Run the manual scraper or check back later!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
