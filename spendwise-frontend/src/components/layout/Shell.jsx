import React from 'react';
import { LayoutDashboard, Wallet, PieChart, LogOut, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const tabs = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { key: 'expenses', label: 'Expenses', icon: Plus, to: '/expenses' },
  { key: 'budgets', label: 'Budgets', icon: PieChart, to: '/budgets' },
];

const NavItem = ({ icon: Icon, label, active, to }) => (
  <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${active ? 'bg-brand text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export default function Shell({ children, activeTab }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const getInitials = () => {
    const name = String(user?.name || '').trim();
    if (!name) return 'GU';
    const words = name.split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface flex">
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-100 flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white shadow-lg"><Wallet size={24} /></div>
          <span className="text-xl font-bold text-gray-900">SpendWise</span>
        </div>

        <nav className="space-y-2 flex-1">
          {tabs.map((item) => (
            <NavItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              to={item.to}
              active={activeTab === item.key}
            />
          ))}
        </nav>

        <div className="border-t border-gray-100 pt-6 mt-auto">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 w-full" onClick={handleLogout} type="button">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-800 capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-brand text-sm font-bold text-white shadow-sm">
              {getInitials()}
            </div>
          </div>
        </header>
        <div className="p-8 pb-24 lg:pb-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-20">
        <Link to="/"><LayoutDashboard className="text-brand" /></Link>
        <Link to="/expenses"><Plus className="text-gray-400" /></Link>
        <Link to="/budgets"><PieChart className="text-gray-400" /></Link>
      </nav>
    </div>
  );
}
