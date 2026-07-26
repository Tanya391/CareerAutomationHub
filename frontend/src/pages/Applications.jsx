import React, { useState, useEffect } from 'react';
import { getApplications, updateApplicationStatus, deleteApplication } from '../services/applicationApi';
import { formatSalaryToLPA } from '../utils/formatters';
import { 
  Building, 
  MapPin, 
  Calendar, 
  Trash2, 
  Kanban,
  CheckCircle,
  Briefcase
} from 'lucide-react';

const COLUMNS = [
  { id: 'Saved', title: 'Saved', color: 'border-slate-300 text-slate-700', badgeBg: 'bg-slate-100 text-slate-700 border border-slate-200' },
  { id: 'Applied', title: 'Applied', color: 'border-brand-300 text-brand-700', badgeBg: 'bg-brand-50 text-brand-700 border border-brand-200' },
  { id: 'Interviews', title: 'Interviews', color: 'border-amber-300 text-amber-700', badgeBg: 'bg-amber-50 text-amber-700 border border-amber-200' },
  { id: 'Rejected', title: 'Rejected', color: 'border-rose-300 text-rose-700', badgeBg: 'bg-rose-50 text-rose-700 border border-rose-200' },
  { id: 'Offer', title: 'Offer', color: 'border-emerald-300 text-emerald-700', badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
];

export const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const data = await getApplications();
      setApplications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateApplicationStatus(id, newStatus);
      setApplications((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveApplication = async (id) => {
    try {
      await deleteApplication(id);
      setApplications((prev) => prev.filter((app) => app._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center text-slate-500 font-semibold text-sm">Loading Tracker...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Kanban className="h-5 w-5 text-brand-700" /> Application Tracking Board
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your active pipeline. Use the column dropdown on any card to transition its stage.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
          Total Tracked: <span className="text-brand-700 font-bold">{applications.length}</span>
        </div>
      </div>

      {/* Horizontal Scrolling Layout */}
      <div className="w-full overflow-x-auto pb-6">
        <div className="flex flex-row gap-5 min-w-[1280px]">
          {COLUMNS.map((col) => {
            const columnApps = applications.filter((app) => app.status === col.id);

            return (
              <div
                key={col.id}
                className="flex-1 min-w-[280px] max-w-[340px] bg-slate-50/80 border border-slate-200 rounded-2xl p-4 flex flex-col h-[700px] shadow-2xs"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.id === 'Offer' ? 'bg-emerald-500' : col.id === 'Interviews' ? 'bg-amber-500' : col.id === 'Applied' ? 'bg-brand-600' : col.id === 'Rejected' ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
                    <h3 className="text-sm font-bold text-slate-800">{col.title}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.badgeBg}`}>
                    {columnApps.length}
                  </span>
                </div>

                {/* Column Cards Stream */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {columnApps.length > 0 ? (
                    columnApps.map((app) => {
                      const job = app.job_id || {};
                      
                      return (
                      <div
                        key={app._id}
                        className="bg-white border border-slate-200 hover:border-brand-300 rounded-xl p-4 shadow-2xs transition-all space-y-3 relative group"
                      >
                        {/* Company & Title */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                              <Building className="h-3.5 w-3.5 text-brand-700" />
                              {job.company_name || 'Unknown Company'}
                            </span>
                            <button
                              onClick={() => handleRemoveApplication(app._id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                              title="Remove card"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {job.title || 'Unknown Role'}
                          </h4>
                        </div>

                        {/* Location & Salary in LPA */}
                        <div className="space-y-1 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span className="truncate">{job.location || 'Remote'}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              {formatSalaryToLPA(job.salary_max)}
                            </span>
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                              {job.work_mode || 'Remote'}
                            </span>
                          </div>
                        </div>

                        {/* Notes if available */}
                        {app.notes && (
                          <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 italic">
                            "{app.notes}"
                          </div>
                        )}

                        {/* Date applied */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Calendar className="h-3 w-3" />
                          <span>Tracked on {new Date(app.applied_at || app.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Status Change Dropdown Menu */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            Move to:
                          </span>
                          <select
                            value={app.status}
                            onChange={(e) =>
                              handleUpdateStatus(app._id, e.target.value)
                            }
                            className="text-xs bg-slate-50 text-brand-700 border border-slate-200 rounded-lg px-2 py-1 font-semibold focus:outline-none focus:border-brand-700 cursor-pointer"
                          >
                            <option value="Saved">Saved</option>
                            <option value="Applied">Applied</option>
                            <option value="Interviews">Interviews</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Offer">Offer</option>
                          </select>
                        </div>
                      </div>
                    )})
                  ) : (
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                      No jobs in {col.title}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Applications;
