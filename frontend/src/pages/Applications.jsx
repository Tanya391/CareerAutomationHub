import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getApplications, updateApplication } from '../services/applicationApi';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  Edit3, 
  FileText,
  Clock,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const COLUMNS = [
  { key: 'Saved', title: 'Saved Jobs', borderClass: 'border-t-slate-500', textClass: 'text-slate-400', bgClass: 'bg-slate-500/5' },
  { key: 'Applied', title: 'Applied', borderClass: 'border-t-blue-500', textClass: 'text-blue-400', bgClass: 'bg-blue-500/5' },
  { key: 'Interview Scheduled', title: 'Interviews', borderClass: 'border-t-purple-500', textClass: 'text-purple-400', bgClass: 'bg-purple-500/5' },
  { key: 'Rejected', title: 'Rejected', borderClass: 'border-t-rose-500', textClass: 'text-rose-400', bgClass: 'bg-rose-500/5' },
  { key: 'Offer', title: 'Offer Received', borderClass: 'border-t-emerald-500', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500/5' }
];

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingApp, setEditingApp] = useState(null); // Modal state
  const [modalNotes, setModalNotes] = useState('');
  const [modalStatus, setModalStatus] = useState('');

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await getApplications();
      setApplications(data);
    } catch (error) {
      console.error('Failed to load application tracker:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleOpenEditModal = (app) => {
    setEditingApp(app);
    // Find current application notes by fetching or from loaded item
    const fullApp = applications.find(a => a.application_id === app.application_id);
    setModalNotes(fullApp?.notes || '');
    setModalStatus(app.status);
  };

  const handleSaveModal = async () => {
    if (!editingApp) return;
    try {
      await updateApplication(editingApp.application_id, {
        status: modalStatus,
        notes: modalNotes
      });
      setEditingApp(null);
      loadApplications();
    } catch (error) {
      console.error('Failed to update application details:', error);
    }
  };

  // Quick move status
  const handleQuickMove = async (appId, targetStatus) => {
    try {
      await updateApplication(appId, { status: targetStatus });
      loadApplications();
    } catch (error) {
      console.error('Failed to quick shift status:', error);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-950 flex flex-col">
      <Navbar title="Kanban Application Tracker" onRefreshData={loadApplications} />
      
      <main className="flex-1 p-8 space-y-6 max-w-[90rem] w-full mx-auto overflow-x-auto">
        
        {loading ? (
          <div className="flex-1 min-h-[450px] flex items-center justify-center border border-slate-800 rounded-xl bg-slate-900/10">
            <div className="text-slate-500 font-semibold text-sm">Loading tracker board...</div>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex-grow min-h-[400px] flex flex-col items-center justify-center border border-slate-800 rounded-xl bg-slate-900/10 text-center p-8">
            <FileText className="w-12 h-12 text-slate-700 mb-3" />
            <h3 className="font-bold text-slate-300 text-lg">Your Kanban Board is Empty</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-xs">
              Go to the Jobs Explorer and click "Track" on any job cards to populate this tracking board.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5 min-w-[1000px] items-start">
            {COLUMNS.map(col => {
              const columnApps = applications.filter(app => app.status === col.key);
              
              return (
                <div key={col.key} className={`rounded-xl border border-slate-800/80 border-t-4 ${col.borderClass} ${col.bgClass} p-4 flex flex-col min-h-[500px]`}>
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/60">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{col.title}</span>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 font-bold px-2 py-0.5 rounded text-slate-300">
                      {columnApps.length}
                    </span>
                  </div>

                  {/* Cards stack */}
                  <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                    {columnApps.map(app => (
                      <div 
                        key={app.application_id} 
                        className="bg-slate-900 border border-slate-850 p-4 rounded-xl hover:border-slate-700/60 transition-all duration-300 flex flex-col group relative"
                      >
                        {/* Company & Title */}
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-brand-400 transition-colors">{app.job_title}</h4>
                          <span className="text-[9px] font-black text-brand-400 bg-brand-500/10 border border-brand-500/20 px-1.5 py-0.5 rounded">
                            {app.match_score}%
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-slate-400">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span>{app.company_name}</span>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-3 mt-3 text-[9px] text-slate-400 font-medium">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span className="truncate max-w-[70px]">{app.job_location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{new Date(app.saved_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Display Notes snippet if exists */}
                        {app.notes && (
                          <div className="mt-3 bg-slate-950 p-2 rounded-lg border border-slate-850 text-[9px] text-slate-400 line-clamp-2">
                            <strong>Notes:</strong> {app.notes}
                          </div>
                        )}

                        {/* Actions Footer */}
                        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-850/60 justify-between items-center">
                          {/* Apply portal external link */}
                          <a 
                            href={app.apply_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[9px] text-slate-400 hover:text-slate-200 flex items-center gap-0.5"
                          >
                            Apply Link
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>

                          <div className="flex gap-1.5 items-center">
                            {/* Quick move selector */}
                            <div className="relative group/menu">
                              <button className="p-1 rounded bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              
                              {/* Quick Move drop menu */}
                              <div className="absolute left-0 bottom-6 hidden group-hover/menu:block bg-slate-900 border border-slate-800 rounded shadow-xl z-20 w-32 py-1">
                                {COLUMNS.filter(c => c.key !== app.status).map(c => (
                                  <button
                                    key={c.key}
                                    onClick={() => handleQuickMove(app.application_id, c.key)}
                                    className="w-full text-left px-2 py-1 text-[9px] font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
                                  >
                                    Move to {c.key.split(' ')[0]}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Edit Modal Button */}
                            <button
                              onClick={() => handleOpenEditModal(app)}
                              className="p-1 rounded bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 text-[9px] font-bold"
                            >
                              <Edit3 className="w-3 h-3" />
                              Details
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                    {columnApps.length === 0 && (
                      <div className="text-[10px] text-slate-600 font-semibold italic text-center py-8">
                        Empty column
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Edit Details & Interview Notes Modal */}
      {editingApp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative">
            <div>
              <h3 className="text-base font-bold text-slate-100">{editingApp.job_title}</h3>
              <p className="text-xs text-slate-400 font-semibold">{editingApp.company_name} | {editingApp.job_location} ({editingApp.work_mode})</p>
            </div>
            
            <hr className="border-slate-800" />
            
            <div className="space-y-4">
              {/* Application Tracking State dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Application Tracking Status</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
                >
                  {COLUMNS.map(col => (
                    <option key={col.key} value={col.key}>{col.title}</option>
                  ))}
                </select>
              </div>

              {/* Notes text area */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interview Logs & Notes</label>
                <textarea
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  rows="5"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all placeholder-slate-600"
                  placeholder="Record your interview questions, reference numbers, contact details, notes, or next steps here..."
                ></textarea>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end border-t border-slate-850 pt-4">
              <button
                onClick={() => setEditingApp(null)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 rounded-lg text-xs font-bold text-white transition-all shadow-md"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Applications;
