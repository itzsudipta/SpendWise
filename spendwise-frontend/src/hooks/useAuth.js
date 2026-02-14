import { useContext } from 'react';
import { FinanceContext } from '../store/FinanceContext';

export function useAuth() {
  const { user, login, logout, isAuthenticated } = useContext(FinanceContext);
  return { user, login, logout, isAuthenticated };
}
