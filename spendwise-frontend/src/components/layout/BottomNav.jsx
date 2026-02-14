import { NavLink } from 'react-router-dom';

const links = [
  ['/', 'Home'],
  ['/expenses', 'Expenses'],
  ['/budgets', 'Budgets'],
  ['/categories', 'Categories'],
  ['/settings', 'Settings'],
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white md:hidden">
      <div className="grid grid-cols-5 text-center text-xs">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} className="px-2 py-3 text-slate-700">
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}