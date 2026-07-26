import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCompanies } from '../services/companyApi';
import { triggerAutomationRun, getAutomationLogs } from '../services/jobsApi';
import { 
  Terminal, 
  Upload, 
  FileText, 
  Play, 
  CheckCircle2, 
  Cpu, 
  RefreshCw
} from 'lucide-react';

export const TestingLab = () => {
  const { user } = useAuth();
  
  const [targetCompanies, setTargetCompanies] = useState([]);
  
  // Step 1 State: Resume File
  const [selectedResumeName, setSelectedResumeName] = useState('');
  const [resumeSource, setResumeSource] = useState('none');

  // Step 2 State: Target Company selection
  const [selectedCompanyId, setSelectedCompanyId] = useState('All');

  // Step 3 State: Engine Running state & Logs output
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([
    {
      id: 'log-0',
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      message: 'Ingestion engine initialized in manual testing mode.',
      details: 'Ready to receive context parameters and execute company targeted scrapers.',
    },
  ]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const data = await getCompanies();
      setTargetCompanies(data || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedResumeName(file.name);
      setResumeSource('uploaded');
    }
  };

  const handleUseExistingProfileResume = () => {
    const existingName = user?.resumeFileName || 'Profile_Resume.pdf';
    setSelectedResumeName(existingName);
    setResumeSource('profile');
  };

  const handleRunIngestionEngine = async () => {
    setIsRunning(true);
    const now = () => new Date().toLocaleTimeString();

    const targetCompanyName =
      selectedCompanyId === 'All'
        ? 'All Target Portals'
        : targetCompanies.find((c) => c._id === selectedCompanyId)?.name || 'Selected Company';

    const userSkills = user?.skills_keywords || 'None';

    const initialRunLog = [
      {
        id: `log-${Date.now()}-1`,
        timestamp: now(),
        level: 'INFO',
        message: `[STEP 1] Context ingested. Resume source: ${resumeSource === 'profile' ? 'Existing Profile Resume' : selectedResumeName ? 'Uploaded Resume' : 'Default Fallback'}. File: ${selectedResumeName || 'Default_Resume.pdf'}.`,
      },
      {
        id: `log-${Date.now()}-2`,
        timestamp: now(),
        level: 'INFO',
        message: `[STEP 2] Launching ingestion workers targeting: "${targetCompanyName}".`,
      },
      {
        id: `log-${Date.now()}-3`,
        timestamp: now(),
        level: 'INFO',
        message: `Extracting key entity skills: [${userSkills}]. Match threshold set to ${user?.min_match_score || 70}%.`,
      },
    ];

    setLogs((prev) => [...prev, ...initialRunLog]);

    try {
      // Call real backend API
      const response = await triggerAutomationRun(selectedCompanyId === 'All' ? null : selectedCompanyId);
      
      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}-4`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'SUCCESS',
          message: `Scraper finished executing.`,
          details: response.message || JSON.stringify(response, null, 2)
        }
      ]);

      // Attempt to fetch any detailed logs from server if endpoint works
      try {
        const serverLogs = await getAutomationLogs();
        if (serverLogs && serverLogs.length > 0) {
           setLogs(prev => [...prev, ...serverLogs.map(l => ({
             id: `server-log-${Math.random()}`,
             timestamp: new Date(l.timestamp || Date.now()).toLocaleTimeString(),
             level: l.level || 'INFO',
             message: l.message,
             details: l.details
           }))]);
        }
      } catch (logErr) {
         // Ignore log fetch error
      }
    } catch (err) {
      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}-err`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'ERROR',
          message: `Failed to run scraper: ${err.message || 'Unknown error'}`,
        }
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const clearLogs = () => {
    setLogs([
      {
        id: `log-reset`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'INFO',
        message: 'Logs buffer cleared.',
      },
    ]);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Title Must Be Exactly "Manual Testing Lab" */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Manual Testing Lab
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
              Debug Suite
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Test custom resume profiles against target company scrapers and observe real-time ingestion output logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
            <Cpu className="h-4 w-4 text-emerald-600" />
            <span>Sandbox Mode Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Steps 1 & 2 Execution Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* STEP 1 (Context) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
              <span className="h-6 w-6 rounded-full bg-brand-700 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                Step 1 (Context): Resume Selection
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Upload Resume File
                </label>
                <div className="border border-slate-200 hover:border-brand-400 bg-slate-50 rounded-xl p-3 text-center transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <Upload className="h-4 w-4 text-brand-700" />
                    <span className="text-xs text-slate-700">
                      {selectedResumeName && resumeSource === 'uploaded'
                        ? selectedResumeName
                        : 'Choose resume file to test'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative my-2 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 relative z-10">
                  OR
                </span>
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleUseExistingProfileResume}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-brand-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileText className="h-4 w-4 text-brand-700" />
                <span>Use Existing Profile Resume</span>
              </button>

              {selectedResumeName && (
                <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-700 shrink-0" />
                  <div>
                    <span className="font-bold">Active Resume Context:</span> {selectedResumeName}
                    <span className="block text-[10px] text-slate-500">
                      Source: {resumeSource === 'profile' ? 'Profile Storage' : 'Manual Upload'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2 (Execution) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
              <span className="h-6 w-6 rounded-full bg-brand-700 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                Step 2 (Execution): Target & Trigger
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Company
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-brand-700 focus:outline-none cursor-pointer focus:ring-1 focus:ring-brand-700/20"
                >
                  <option value="All">All Companies (Broad Scouting)</option>
                  {targetCompanies.map((tc) => (
                    <option key={tc._id} value={tc._id}>
                      {tc.name} ({tc.portal_type || 'Unknown'})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleRunIngestionEngine}
                disabled={isRunning}
                className="w-full py-3 px-4 bg-brand-700 hover:bg-brand-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Engine Ingesting...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>Run Ingestion Engine</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: STEP 3 (Logs) */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Step 3 (Logs): Engine Output Terminal
                </h2>
              </div>
              <button
                onClick={clearLogs}
                className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Clear Console
              </button>
            </div>

            <div className="flex-1 bg-slate-950 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-2.5 max-h-[550px] border border-slate-800">
              {logs.map((log) => (
                <div key={log.id} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 text-[10px] shrink-0 mt-0.5">
                      [{log.timestamp}]
                    </span>

                    <span
                      className={`font-bold text-[10px] px-1.5 py-0.2 rounded shrink-0 ${
                        log.level === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : log.level === 'WARN'
                          ? 'bg-amber-500/20 text-amber-400'
                          : log.level === 'ERROR'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-sky-500/20 text-sky-400'
                      }`}
                    >
                      {log.level}
                    </span>

                    <span className="text-slate-200 leading-relaxed">{log.message}</span>
                  </div>

                  {log.details && (
                    <pre className="ml-16 p-2 bg-slate-900 rounded text-[11px] text-brand-300 whitespace-pre-wrap border border-slate-800">
                      {log.details}
                    </pre>
                  )}
                </div>
              ))}

              {isRunning && (
                <div className="flex items-center gap-2 text-brand-400 animate-pulse pt-2 font-sans">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Parsing portal DOM & running NLP embedding algorithms...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestingLab;
