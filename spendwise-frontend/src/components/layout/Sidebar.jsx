import { NavLink } from 'react-router-dom';

const links = [
  ['/', 'Dashboard'],
  ['/expenses', 'Expenses'],
  ['/budgets', 'Budgets'],
  ['/categories', 'Categories'],
  ['/settings', 'Settings'],
];

export default function Sidebar() {
  return (
    <aside className="hidden w-64 border-r border-slate-200 bg-white p-4 md:block">
      <h1 className="mb-6 text-xl font-bold text-emerald-800">SpendWise</h1>
      <nav className="space-y-1">
        {links.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}