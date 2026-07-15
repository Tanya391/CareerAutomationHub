import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters';
import JobCard from '../components/JobCard';
import { getJobs } from '../services/jobsApi';
import { getCompanies } from '../services/companyApi';
import { getApplications, createApplication } from '../services/applicationApi';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';

const Jobs = () => {
  const { user } = useAuth();
  
  // States
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [trackedJobs, setTrackedJobs] = useState({}); // job_id -> status
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    company_id: '',
    work_mode: '',
    employment_type: '',
    experience: '',
    sort: 'newest'
  });
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    limit: 10
  });

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch companies and user tracker states
      const [companiesData, appsData] = await Promise.all([
        getCompanies(),
        getApplications()
      ]);
      setCompanies(companiesData);
      
      // Map tracked status (job_id -> status)
      const mapped = {};
      appsData.forEach(app => {
        mapped[app.job_id] = app.status;
      });
      setTrackedJobs(mapped);

      // Fetch jobs using filters and search term
      const jobsParams = {
        page,
        limit: 9, // 9 items per page fits a 3-column layout nicely
        sort: filters.sort,
        search: search || undefined,
        company_id: filters.company_id || undefined,
        work_mode: filters.work_mode || undefined,
        employment_type: filters.employment_type || undefined,
        experience: filters.experience || undefined
      };

      const jobsData = await getJobs(jobsParams);
      setJobs(jobsData.jobs || []);
      setPagination(jobsData.pagination || { total: 0, totalPages: 1, limit: 9 });

    } catch (error) {
      console.error('Failed to load jobs list:', error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger reload when page or filters modify
  useEffect(() => {
    loadData();
  }, [page, filters]);

  // Debounced search trigger (reload on query search change after delay, or we can let user hit enter,
  // but let's implement immediate load trigger since it's simple)
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1); // reset to page 1 on new search
      loadData();
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  const handleTrackJob = async (jobId) => {
    try {
      await createApplication({ job_id: jobId, status: 'Saved' });
      // Reload applications mapping
      const appsData = await getApplications();
      const mapped = {};
      appsData.forEach(app => {
        mapped[app.job_id] = app.status;
      });
      setTrackedJobs(mapped);
    } catch (error) {
      console.error('Failed to save job tracker item:', error);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-950 flex flex-col">
      <Navbar title="Jobs Explorer" onRefreshData={loadData} />
      
      <main className="flex-1 p-8 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Search and Filters Layout */}
        <div className="space-y-4">
          <SearchBar value={search} onChange={setSearch} />
          <Filters 
            filters={filters} 
            onFilterChange={(newFilters) => {
              setPage(1);
              setFilters(newFilters);
            }} 
            companies={companies}
          />
        </div>

        {/* Jobs Listing Grid */}
        {loading ? (
          <div className="flex-1 min-h-[400px] flex items-center justify-center border border-slate-800 rounded-xl bg-slate-900/10">
            <div className="text-slate-500 font-semibold text-sm">Searching aggregated database...</div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center border border-slate-800 rounded-xl bg-slate-900/10 text-center p-8">
            <Briefcase className="w-12 h-12 text-slate-700 mb-3" />
            <h3 className="font-bold text-slate-300 text-lg">No Job Opportunities Found</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-xs">
              No jobs fit the specified filters. Try modifying your filters or triggering a scraper run.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  userSkillsString={user?.skills_keywords}
                  trackedStatus={trackedJobs[job.id]}
                  onTrackJob={handleTrackJob}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-850 pt-4 text-xs font-semibold text-slate-400">
                <span>
                  Showing {(page - 1) * pagination.limit + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} positions
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(prev => prev - 1)}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-white">
                    Page {page} of {pagination.totalPages}
                  </span>
                  <button
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage(prev => prev + 1)}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default Jobs;
