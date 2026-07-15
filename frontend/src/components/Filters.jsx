import React from 'react';

const Filters = ({ filters, onFilterChange, companies = [] }) => {
  const workModes = ['Remote', 'Hybrid', 'Onsite'];
  const jobTypes = ['Full-Time', 'Internship'];
  const expLevels = ['Fresher', '1-3 years', '3+ years', 'Not specified'];

  const handleChange = (key, val) => {
    onFilterChange({
      ...filters,
      [key]: val === 'All' ? '' : val
    });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
      {/* Company filter */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Company</label>
        <select
          value={filters.company_id || 'All'}
          onChange={(e) => handleChange('company_id', e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
        >
          <option value="All">All Companies</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.company_name}</option>
          ))}
        </select>
      </div>

      {/* Work Mode */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Work Mode</label>
        <select
          value={filters.work_mode || 'All'}
          onChange={(e) => handleChange('work_mode', e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
        >
          <option value="All">All Modes</option>
          {workModes.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Employment Type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Job Type</label>
        <select
          value={filters.employment_type || 'All'}
          onChange={(e) => handleChange('employment_type', e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
        >
          <option value="All">All Types</option>
          {jobTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Experience Level */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Experience</label>
        <select
          value={filters.experience || 'All'}
          onChange={(e) => handleChange('experience', e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
        >
          <option value="All">All Levels</option>
          {expLevels.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* Sort options */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Sort By</label>
        <select
          value={filters.sort || 'newest'}
          onChange={(e) => handleChange('sort', e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
        >
          <option value="newest">Newest Discovered</option>
          <option value="oldest">Oldest Discovered</option>
          <option value="company">Company Name</option>
        </select>
      </div>
    </div>
  );
};

export default Filters;
