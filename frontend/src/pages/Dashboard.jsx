import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MetricCard from '../components/MetricCard';
import { 
  Briefcase, 
  Bookmark, 
  Building2, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { getJobs, getAutomationLogs } from '../services/jobsApi';
import { getCompanies } from '../services/companyApi';
import { getApplications, createApplication } from '../services/applicationApi';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalJobs: 0,
    applications: 0,
    companies: 0,
    successRuns: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [trackedJobIds, setTrackedJobIds] = useState({}); // job_id -> status
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch data in parallel
      const [jobsData, companiesData, appsData, logsData] = await Promise.all([
        getJobs({ limit: 5 }),
        getCompanies(),
        getApplications(),
        getAutomationLogs()
      ]);

      // Calculate stats
      const totalJobsCount = jobsData.pagination?.total || 0;
      const appsCount = appsData.length;
      const companiesCount = companiesData.length;
      const successRunsCount = logsData.filter(log => log.status === 'SUCCESS').length;

      setStats({
        totalJobs: totalJobsCount,
        applications: appsCount,
        companies: companiesCount,
        successRuns: successRunsCount
      });

      setRecentJobs(jobsData.jobs || []);
      setRecentScans(logsData.slice(0, 5) || []);

      // Map tracked job IDs
      const mappedTracked = {};
      appsData.forEach(app => {
        mappedTracked[app.job_id] = app.status;
      });
      setTrackedJobIds(mappedTracked);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTrackJob = async (jobId) => {
    try {
      await createApplication({ job_id: jobId, status: 'Saved' });
      // Refresh dashboard
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to track job:', error);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-950 flex flex-col">
      <Navbar title="Dashboard Overview" onRefreshData={fetchDashboardData} />
      
      <main className="flex-1 p-8 space-y-8 max-w-7xl w-full mx-auto">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 border border-slate-800 rounded-2xl">
          <div>
            <h1 className="text-xl font-bold text-slate-100">Welcome back, {user?.name}!</h1>
            <p className="text-slate-400 text-xs mt-1">
              Your resume scanner is searching for positions matching <span className="text-brand-400 font-bold">"{user?.skills_keywords}"</span>.
            </p>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 font-semibold text-xs self-start md:self-auto">
            <span>Alert Threshold: {user?.min_match_score}% Match</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <MetricCard
            title="Jobs Aggregated"
            value={stats.totalJobs}
            icon={Briefcase}
            description="Total scraped positions"
            colorClass="bg-brand-500/10 text-brand-400 border border-brand-500/20"
          />
          <MetricCard
            title="Job Applications"
            value={stats.applications}
            icon={Bookmark}
            description="Active listings in tracker"
            colorClass="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          />
          <MetricCard
            title="Monitored Portals"
            value={stats.companies}
            icon={Building2}
            description="Company career sites active"
            colorClass="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
          />
          <MetricCard
            title="Scraper Heartbeats"
            value={stats.successRuns}
            icon={Activity}
            description="Successful scraper cycles"
            colorClass="bg-purple-500/10 text-purple-400 border border-purple-500/20"
          />
        </div>

        {/* Dynamic content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent opportunities */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-100">Latest Discovered Jobs</h3>
              <button 
                onClick={() => navigate('/jobs')} 
                className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-bold transition-all"
              >
                Explore All
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="h-60 bg-slate-900/20 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-sm font-semibold">
                Loading records...
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="h-60 bg-slate-900/20 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-sm font-semibold text-center p-8">
                No jobs listed in the database yet.<br />Click "Run Ingestion" above to scan company portals!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentJobs.slice(0, 4).map(job => (
                  <div key={job.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/60 transition-all group">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-brand-400 font-bold uppercase">{job.company_name}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">{new Date(job.discovered_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-bold text-slate-100 mt-2 line-clamp-1 group-hover:text-brand-400 transition-colors">{job.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">📍 {job.location} | 💼 {job.experience}</p>
                    </div>
                    
                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800/50 justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400">{job.salary || 'Not disclosed'}</span>
                      {trackedJobIds[job.id] ? (
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                          {trackedJobIds[job.id]}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleTrackJob(job.id)}
                          className="text-[10px] text-brand-400 hover:text-brand-300 font-bold"
                        >
                          + Track
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scraper operational heartbeats logs panel */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-100">Scraper Operational Activity</h3>

            {loading ? (
              <div className="h-60 bg-slate-900/20 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-sm font-semibold">
                Loading logs...
              </div>
            ) : recentScans.length === 0 ? (
              <div className="h-60 bg-slate-900/20 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-sm font-semibold text-center p-6">
                No activity logs. Start ingestion to populate logs.
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
                {recentScans.map(scan => (
                  <div key={scan.id} className="flex gap-3 border-b border-slate-800 last:border-b-0 pb-3 last:pb-0">
                    <div className="mt-0.5">
                      {scan.status === 'SUCCESS' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{scan.company_name}</h4>
                        <span className="text-[9px] text-slate-500 font-semibold">{new Date(scan.start_time).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {scan.status === 'SUCCESS' 
                          ? `Ingested successfully. Found: ${scan.jobs_found}, Added: ${scan.jobs_added}`
                          : `Failed: ${scan.error_message ? scan.error_message.split('\n')[0] : 'Scraper timeout'}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
};

export default Dashboard;
