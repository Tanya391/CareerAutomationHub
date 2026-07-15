import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getCompanies, addCompany, updateCompany, deleteCompany } from '../services/companyApi';
import { Building2, Plus, Trash2, ToggleLeft, ToggleRight, Loader2, AlertCircle, Calendar } from 'lucide-react';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [careerUrl, setCareerUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await getCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!companyName || !careerUrl) return setError('Please enter both name and career page URL.');

    setError('');
    setSuccess('');
    setActionLoading(true);
    try {
      await addCompany({ company_name: companyName, career_url: careerUrl, is_active: true });
      setSuccess('Company added successfully!');
      setCompanyName('');
      setCareerUrl('');
      loadCompanies();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add company target.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (company) => {
    try {
      await updateCompany(company.id, {
        is_active: !company.is_active
      });
      loadCompanies();
    } catch (err) {
      console.error('Failed to toggle active status:', err);
    }
  };

  const handleDeleteCompany = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company? All associated jobs and scan logs will be removed!')) return;
    try {
      await deleteCompany(id);
      loadCompanies();
    } catch (err) {
      console.error('Failed to delete company:', err);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-950 flex flex-col">
      <Navbar title="Company Portals Manager" onRefreshData={loadCompanies} />
      
      <main className="flex-1 p-8 space-y-8 max-w-7xl w-full mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Company target panel */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 h-fit space-y-5">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Add Career Target Portal</h3>
              <p className="text-[10px] text-slate-500 mt-1 font-semibold">Configure a company career page to monitor for new roles.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{success}</span>
              </div>
            )}

            <form onSubmit={handleAddCompany} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg text-xs focus:outline-none placeholder-slate-600 text-slate-200"
                  placeholder="e.g. Google"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Careers Page URL</label>
                <input
                  type="url"
                  value={careerUrl}
                  onChange={(e) => setCareerUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg text-xs focus:outline-none placeholder-slate-600 text-slate-200"
                  placeholder="e.g. https://careers.google.com/jobs/"
                  required
                />
                <p className="text-[8px] text-slate-500 leading-normal font-semibold">
                  For local testing, you can use:<br />
                  Atlassian: <span className="text-slate-400 select-all">http://localhost:5001/template/json-ld</span><br />
                  Stripe: <span className="text-slate-400 select-all">http://localhost:5001/template/infinite-scroll</span><br />
                  Canva: <span className="text-slate-400 select-all">http://localhost:5001/template/table</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                {actionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                Add Target Site
              </button>
            </form>
          </div>

          {/* List of current targets */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Monitored Career Sites</h3>

            {loading ? (
              <div className="h-60 bg-slate-900/20 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-sm font-semibold">
                Loading career portals...
              </div>
            ) : companies.length === 0 ? (
              <div className="h-60 bg-slate-900/20 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-sm font-semibold text-center p-8">
                No companies configured yet.
              </div>
            ) : (
              <div className="space-y-4">
                {companies.map(comp => (
                  <div key={comp.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-slate-700/60 transition-all duration-300">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-brand-400" />
                        <h4 className="font-bold text-slate-100 text-sm">{comp.company_name}</h4>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          comp.is_active 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {comp.is_active ? 'Active scanner' : 'Paused'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate font-semibold">{comp.career_url}</p>
                      
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Last scan: {comp.last_scan ? new Date(comp.last_scan).toLocaleString() : 'Never scanned'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 self-end md:self-auto border-t border-slate-800 md:border-t-0 pt-3 md:pt-0">
                      {/* Active Toggle Switch */}
                      <button
                        onClick={() => handleToggleActive(comp)}
                        className={`flex items-center gap-1 text-[10px] font-bold transition-colors ${
                          comp.is_active ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        {comp.is_active ? (
                          <>
                            <ToggleRight className="w-7 h-7" />
                            <span>Scan On</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-7 h-7" />
                            <span>Scan Off</span>
                          </>
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteCompany(comp.id)}
                        className="p-2 rounded bg-slate-950 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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

export default Companies;
