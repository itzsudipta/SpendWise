export default function ProgressBar({ value = 0, max = 100 }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const tone = percent < 75 ? 'bg-emerald-600' : percent < 100 ? 'bg-amber-500' : 'bg-rose-600';

  return (
    <div className="w-full rounded-full bg-slate-200">
      <div className={`h-2 rounded-full ${tone}`} style={{ width: `${percent}%` }} />
    </div>
  );
}