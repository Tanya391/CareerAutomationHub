import React from 'react';

const MetricCard = ({ title, value, icon: Icon, description, colorClass }) => {
  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/60 transition-all duration-300 flex items-center justify-between">
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <h3 className="text-2xl font-black text-slate-100">{value}</h3>
        {description && <p className="text-[10px] text-slate-500 font-medium">{description}</p>}
      </div>
      <div className={`p-3 rounded-lg ${colorClass || 'bg-brand-500/10 text-brand-400'}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};

export default MetricCard;
