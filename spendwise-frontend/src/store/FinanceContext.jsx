import React, { createContext, useMemo, useState } from 'react';

export const FinanceContext = createContext(null);

const COOKIE_KEY = 'spendwise_user';

const getCookieValue = (name) => {
  const encodedName = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(encodedName)) {
      return decodeURIComponent(trimmed.substring(encodedName.length));
    }
  }
  return '';
};

const setCookieValue = (name, value, days = 7) => {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

const clearCookieValue = (name) => {
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`;
};

export default function FinanceProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      localStorage.removeItem(COOKIE_KEY);
    } catch {
      // ignore cleanup errors
    }
    try {
      clearCookieValue(COOKIE_KEY);
    } catch {
      // ignore cleanup errors
    }
    return null;
  });

  const login = (nextUser) => {
    setUser(nextUser);
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}
