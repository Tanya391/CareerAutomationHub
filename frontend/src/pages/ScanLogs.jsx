import React, { useState, useEffect } from 'react';
import { getAutomationLogs } from '../services/jobsApi';
import { FileTerminal, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

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
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-sm">
          <CheckCircle className="w-3 h-3" />
          SUCCESS
        </span>
      );
    }
    if (status === 'LAYOUT_CHANGED') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full shadow-sm">
          <AlertTriangle className="w-3 h-3" />
          LAYOUT CHANGED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full shadow-sm">
        <XCircle className="w-3 h-3" />
        FAILED
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileTerminal className="h-5 w-5 text-brand-700" /> Scraper Audit Trails
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed logs of active crawling cycles, execution times, and ingestion rates.
          </p>
        </div>
        <button
          onClick={loadLogs}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:text-brand-700 hover:border-brand-200 hover:bg-brand-50 text-xs font-bold transition-all disabled:opacity-50 shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Logs
        </button>
      </div>

      {loading ? (
        <div className="h-60 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 text-sm font-semibold shadow-sm">
          Loading logs from database...
        </div>
      ) : logs.length === 0 ? (
        <div className="h-60 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-sm font-semibold p-8 text-center shadow-sm">
          <FileTerminal className="w-10 h-10 text-slate-400 mb-2" />
          No scans recorded yet. Run ingestion to start.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-slate-600">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Company Portal</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Start Time</th>
                  <th className="px-6 py-4">End Time</th>
                  <th className="px-6 py-4 text-center">Jobs Found</th>
                  <th className="px-6 py-4 text-center">Jobs Added</th>
                  <th className="px-6 py-4">Diagnostics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium bg-white">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{log.company_name}</td>
                    <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(log.start_time).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-500">{log.end_time ? new Date(log.end_time).toLocaleString() : 'Pending'}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700">{log.jobs_found}</td>
                    <td className="px-6 py-4 text-center font-bold text-brand-600">{log.jobs_added}</td>
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
    </div>
  );
};

export default ScanLogs;
