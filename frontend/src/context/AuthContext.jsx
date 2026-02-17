import React, { createContext, useEffect, useMemo, useState } from 'react';
import api, { setAccessToken } from '../services/api';

export const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => {},
  logout: async () => {},
  refreshing: false,
  ready: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setAccessToken(token);
    } else {
      localStorage.removeItem('token');
      setAccessToken(null);
    }
  }, [token]);

  useEffect(() => {
    async function restoreSession() {
      setRefreshing(true);
      try {
        const { data } = await api.post('/auth/refresh');
        setUser(data.user);
        setToken(data.accessToken);
      } catch (err) {
        setUser(null);
        setToken(null);
      } finally {
        setRefreshing(false);
        setReady(true);
      }
    }

    if (!user && !token) {
      restoreSession();
    } else {
      setReady(true);
    }
  }, []);

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    setUser(data.user);
    setToken(data.accessToken);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      /* ignore */
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      setUser,
      setToken,
      refreshing,
      ready,
    }),
    [user, token, refreshing, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
