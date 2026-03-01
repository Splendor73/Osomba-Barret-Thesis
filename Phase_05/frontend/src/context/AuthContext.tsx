import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSession, getUser, getUserRole, logoutUser } from '../lib/auth';

type Role = 'customer' | 'agent' | 'admin' | null;

interface AuthContextType {
  user: any | null;
  role: Role;
  isAuthenticated: boolean;
  loading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isAuthenticated: false,
  loading: true,
  refreshSession: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    setLoading(true);
    try {
      const session = await getSession();
      if (session) {
        const currentUser = await getUser();
        const currentRole = await getUserRole();
        setUser(currentUser);
        setRole(currentRole);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error fetching auth session:', error);
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated, loading, refreshSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
