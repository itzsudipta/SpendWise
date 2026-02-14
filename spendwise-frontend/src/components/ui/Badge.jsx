export default function Badge({ children, tone = 'neutral' }) {
  const styles = {
    neutral: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
  };

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${styles[tone]}`}>{children}</span>;
}