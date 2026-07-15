import React, { useState } from 'react';
import { Play, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { triggerAutomationRun } from '../services/jobsApi';

const Navbar = ({ title, onRefreshData }) => {
  const [running, setRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success', 'error'

  const handleTriggerRun = async () => {
    if (running) return;
    setRunning(true);
    setStatusMessage('Automation scan active... launching Playwright browser.');
    setStatusType('');
    
    try {
      const data = await triggerAutomationRun();
      setStatusType('success');
      setStatusMessage(`Scan Finished. Found ${data.results.matchesFound || 0} matches.`);
      
      // Call parent reload callback
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (error) {
      console.error(error);
      setStatusType('error');
      setStatusMessage('Automation scan cycle encountered an error.');
    } finally {
      setRunning(false);
      // Clear status message after 6 seconds
      setTimeout(() => {
        setStatusMessage('');
      }, 6000);
    }
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-slate-100">{title || 'Dashboard'}</h2>
        
        {/* Status ticker for scraper operations */}
        {statusMessage && (
          <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
            statusType === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : statusType === 'error'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : 'bg-brand-500/10 text-brand-400 border-brand-500/20'
          }`}>
            {statusType === 'success' && <CheckCircle className="w-3.5 h-3.5" />}
            {statusType === 'error' && <AlertTriangle className="w-3.5 h-3.5" />}
            {running && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {statusMessage}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Trigger Cron Automation Run Button */}
        <button
          onClick={handleTriggerRun}
          disabled={running}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
            running
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              : 'bg-brand-600 hover:bg-brand-700 text-white hover:shadow-brand-500/20 shadow-brand-600/10'
          }`}
        >
          {running ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Scanning Sites...
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Ingestion
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
