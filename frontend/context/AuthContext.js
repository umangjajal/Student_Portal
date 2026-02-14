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

      // ✅ Changed to sessionStorage (Clears when tab closes)
      const token = sessionStorage.getItem('token');

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Token expired
        if (decoded.exp < currentTime) {
          console.warn("Token expired");
          sessionStorage.removeItem('token');
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'; // Clear cookie
          setUser(null);
          setLoading(false);
          return;
        }

        // Valid token
        setUser({
          id: decoded.id,
          role: decoded.role,
          referenceId: decoded.referenceId
        });

      } catch (error) {
        console.error("Invalid token:", error);
        sessionStorage.removeItem('token');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'; // Clear cookie
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

    // ✅ Changed to sessionStorage
    sessionStorage.setItem('token', token);

    // ✅ Removed max-age. This makes it a "Session Cookie" that deletes on browser close.
    document.cookie = `token=${token}; path=/; SameSite=Lax`;

    try {
      const decoded = jwtDecode(token);

      setUser({
        id: decoded.id,
        role: decoded.role,
        referenceId: decoded.referenceId
      });

    } catch (error) {
      console.error("Login token decode error:", error);
      sessionStorage.removeItem('token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  };

  /* =========================================
     LOGOUT FUNCTION
  ========================================= */
  const logout = () => {
    // ✅ Changed to sessionStorage
    sessionStorage.removeItem('token');
    
    // Clear Cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}