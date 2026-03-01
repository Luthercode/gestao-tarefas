import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('gestao_user');
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) {
        api.get('/auth/profile')
          .then(res => setUser(res.data))
          .catch(() => localStorage.removeItem('gestao_user'))
          .finally(() => setLoading(false));
        return;
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('gestao_user', JSON.stringify({ token, user: userData }));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('gestao_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
