export default function Input({ label, className = '', ...props }) {
  return (
    <label className="block text-sm">
      {label ? <span className="mb-1 block text-slate-600">{label}</span> : null}
      <input
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-emerald-500 focus:ring-2 ${className}`}
        {...props}
      />
    </label>
  );
}