import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}>
    {children}
  </div>
);

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-brand text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700',
    secondary: 'bg-indigo-50 text-brand hover:bg-indigo-100',
    outline: 'border border-gray-200 text-gray-600 hover:bg-gray-50',
    danger: 'bg-danger text-white hover:bg-red-600',
  };
  return (
    <button className={`px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Badge = ({ children, status = 'info' }) => {
  const styles = {
    info: 'bg-blue-50 text-blue-600',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    error: 'bg-rose-50 text-rose-600',
  };
  return <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${styles[status]}`}>{children}</span>;
};

export const ProgressBar = ({ spent = 0, limit = 0 }) => {
  const safeLimit = limit <= 0 ? 1 : limit;
  const ratio = Math.min((spent / safeLimit) * 100, 100);
  let color = 'bg-safe';
  if (ratio > 90) color = 'bg-danger';
  else if (ratio > 70) color = 'bg-warning';

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
        <span>{formatCurrency(spent)} spent</span>
        <span>{formatCurrency(limit)} limit</span>
      </div>
      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-700 ${color}`} style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
};
