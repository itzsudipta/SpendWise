import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Shell from './components/layout/Shell';
import Dashboard from './pages/dashboard/Dashboard';
import Budgets from './pages/budgets/Budgets';
import ExpenseList from './pages/expenses/ExpenseList';
import Categories from './pages/categories/Categories';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import { useAuth } from './hooks/useAuth';

function RoutedLayout() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const activeTab = pathname === '/' ? 'dashboard' : pathname.split('/')[1] || 'dashboard';

  if (!isAuthenticated && pathname !== '/login' && pathname !== '/signup') {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
    return <Navigate to="/" replace />;
  }

  if (pathname === '/login') return <Login />;
  if (pathname === '/signup') return <Signup />;

  return (
    <Shell activeTab={activeTab}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/expenses" element={<ExpenseList />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}

function App() {
  return (
    <BrowserRouter>
      <RoutedLayout />
    </BrowserRouter>
  );
}

export default App;
