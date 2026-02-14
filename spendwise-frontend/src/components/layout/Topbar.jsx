import { useAuth } from '../../hooks/useAuth';

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Finance Dashboard</h2>
        <p className="text-sm text-slate-600">{user?.name || 'Guest User'}</p>
      </div>
    </header>
  );
}