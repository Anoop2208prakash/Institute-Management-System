// client/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import axios, { type AxiosResponse, type AxiosError } from 'axios';

// Export User interface
export interface User {
  id: string;
  email: string;
  role: string;
  // Add other fields if needed
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Initialize Auth State
  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user data", e);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // 2. Memoize Logout (Stable function reference)
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    // Redirect to login if not already there
    if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
    }
  }, []);

  // 3. Memoize Login
  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  // 4. Axios Interceptor (Auto Logout on 401)
  useEffect(() => {
    // Set default header
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }

    // Define the interceptor logic with explicit types
    const responseInterceptor = (response: AxiosResponse) => response;
    
    const errorInterceptor = (error: AxiosError) => {
        // Check if error response exists and status is 401
        if (error.response && error.response.status === 401) {
             console.warn("Session expired. Logging out...");
             logout();
        }
        return Promise.reject(error);
    };

    // Register the interceptor
    const interceptorId = axios.interceptors.response.use(
      responseInterceptor, 
      errorInterceptor
    );

    // Cleanup
    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};