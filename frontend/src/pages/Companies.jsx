import React, { useState, useEffect } from 'react';
import { getCompanies, addCompany, updateCompany, deleteCompany } from '../services/companyApi';
import { Building2, Plus, Trash2, ToggleLeft, ToggleRight, Loader2, AlertCircle, Calendar, Globe, Building } from 'lucide-react';

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
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add company target.');
      setTimeout(() => setError(''), 4000);
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
    if (!window.confirm('Are you sure you want to delete this target? All associated jobs and logs will be removed.')) return;
    try {
      await deleteCompany(id);
      loadCompanies();
    } catch (err) {
      console.error('Failed to delete company:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-brand-700" /> Target Portals Manager
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure which company career pages the automation engine should monitor and scrape.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Add Company target panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 h-fit space-y-5 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Building className="h-4 w-4 text-brand-700" />
            <h3 className="font-bold text-slate-900 text-sm">Add New Target</h3>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3 rounded-xl shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs p-3 rounded-xl shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{success}</span>
            </div>
          )}

          <form onSubmit={handleAddCompany} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700/20"
                  placeholder="e.g. Acme Corp"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Careers Page URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="url"
                  value={careerUrl}
                  onChange={(e) => setCareerUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700/20"
                  placeholder="https://careers.acme.com/"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-2.5 bg-brand-700 hover:bg-brand-900 disabled:bg-slate-200 disabled:text-slate-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
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
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Monitored Portals</h3>
            <span className="px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg text-xs font-semibold">
              {companies.length} Targets
            </span>
          </div>

          {loading ? (
            <div className="h-40 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 text-sm font-semibold shadow-sm">
              Loading career portals...
            </div>
          ) : companies.length === 0 ? (
            <div className="h-40 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 text-sm font-semibold text-center p-8 shadow-sm">
              No portals configured yet.
            </div>
          ) : (
            <div className="space-y-3">
              {companies.map(comp => (
                <div key={comp.id} className="bg-white border border-slate-200 hover:border-brand-300 rounded-2xl p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 transition-all duration-300 shadow-sm hover:shadow-md">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{comp.company_name}</h4>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        comp.is_active 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {comp.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <a href={comp.career_url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline flex items-center gap-1.5 truncate">
                      <Globe className="h-3.5 w-3.5 shrink-0" /> {comp.career_url}
                    </a>
                    
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold pt-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Last scan: {comp.last_scan ? new Date(comp.last_scan).toLocaleString() : 'Never scanned'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 self-end md:self-auto border-t border-slate-100 md:border-t-0 pt-3 md:pt-0 shrink-0">
                    <button
                      onClick={() => handleToggleActive(comp)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        comp.is_active 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer' 
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 cursor-pointer'
                      }`}
                    >
                      {comp.is_active ? (
                        <>
                          <ToggleRight className="w-4 h-4" />
                          <span>Enabled</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          <span>Disabled</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteCompany(comp.id)}
                      className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all shadow-sm cursor-pointer"
                      title="Delete Target"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Companies;
