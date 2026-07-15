import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getAutomationLogs } from '../services/jobsApi';
import { FileTerminal, CheckCircle, XCircle, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

const ScanLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await getAutomationLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load scan logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getStatusBadge = (status) => {
    if (status === 'SUCCESS') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
          <CheckCircle className="w-3 h-3" />
          SUCCESS
        </span>
      );
    }
    if (status === 'LAYOUT_CHANGED') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3" />
          LAYOUT CHANGED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
        <XCircle className="w-3 h-3" />
        FAILED
      </span>
    );
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-950 flex flex-col">
      <Navbar title="Scraper Audit Trails" onRefreshData={loadLogs} />
      
      <main className="flex-1 p-8 space-y-6 max-w-7xl w-full mx-auto">
        
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Playwright Scraper Scan Logs</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">Audit trail detailing active crawling cycles, execution times, and ingest rates.</p>
          </div>
          
          <button
            onClick={loadLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Logs
          </button>
        </div>

        {loading ? (
          <div className="h-60 bg-slate-900/20 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-sm font-semibold">
            Loading logs from database...
          </div>
        ) : logs.length === 0 ? (
          <div className="h-60 bg-slate-900/20 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 text-sm font-semibold p-8 text-center">
            <FileTerminal className="w-10 h-10 text-slate-700 mb-2" />
            No scans recorded yet. Run ingestion to start.
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs text-slate-300">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Company Portal</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Start Time</th>
                    <th className="px-6 py-4">End Time</th>
                    <th className="px-6 py-4 text-center">Jobs Found</th>
                    <th className="px-6 py-4 text-center">Jobs Added</th>
                    <th className="px-6 py-4">Diagnostics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-100">{log.company_name}</td>
                      <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
                      <td className="px-6 py-4 text-slate-400">{new Date(log.start_time).toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-400">{log.end_time ? new Date(log.end_time).toLocaleString() : 'Pending'}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-200">{log.jobs_found}</td>
                      <td className="px-6 py-4 text-center font-bold text-brand-400">{log.jobs_added}</td>
                      <td className="px-6 py-4 max-w-xs truncate text-[10px] text-slate-500 font-mono">
                        {log.error_message ? log.error_message.split('\n')[0] : 'None'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default ScanLogs;
