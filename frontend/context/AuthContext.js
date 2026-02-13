'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================================
     LOAD USER FROM TOKEN ON APP START
  ========================================= */
  useEffect(() => {
    const initializeAuth = () => {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('token');

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);

        const currentTime = Date.now() / 1000;

        // ❌ Token expired
        if (decoded.exp < currentTime) {
          console.warn("Token expired");
          localStorage.removeItem('token');
          setUser(null);
          setLoading(false);
          return;
        }

        // ✅ Valid token
        setUser({
          id: decoded.id,
          role: decoded.role,
          referenceId: decoded.referenceId
        });

      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
        setUser(null);
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  /* =========================================
     LOGIN FUNCTION
  ========================================= */
  const login = (token) => {
    if (!token) return;

    localStorage.setItem('token', token);

    try {
      const decoded = jwtDecode(token);

      setUser({
        id: decoded.id,
        role: decoded.role,
        referenceId: decoded.referenceId
      });

    } catch (error) {
      console.error("Login token decode error:", error);
      localStorage.removeItem('token');
    }
  };

  /* =========================================
     LOGOUT FUNCTION
  ========================================= */
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =========================================
   CUSTOM HOOK
========================================= */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
