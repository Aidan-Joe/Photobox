import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.js';

/**
 * Custom hook untuk authentication
 * Handle login, logout, dan user state
 */
export function useAuth() {
  const [user, setUser] = useLocalStorage('user', null);
  const [token, setToken] = useLocalStorage('authToken', null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is logged in
  const isLoggedIn = useCallback(() => {
    return !!user && !!token;
  }, [user, token]);

  // Login function
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Ganti dengan actual API call ke CI4
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });

      // Demo untuk development
      const mockUser = {
        id: 1,
        email: email,
        name: email.split('@')[0],
      };

      const mockToken = 'token_' + Date.now();

      setUser(mockUser);
      setToken(mockToken);

      return { success: true, user: mockUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [setUser, setToken]);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
  }, [setUser, setToken]);

  // Register function (optional)
  const register = useCallback(async (email, password, name) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Ganti dengan actual API call ke CI4
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password, name })
      // });

      // Demo
      const mockUser = {
        id: Date.now(),
        email,
        name,
      };

      const mockToken = 'token_' + Date.now();

      setUser(mockUser);
      setToken(mockToken);

      return { success: true, user: mockUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [setUser, setToken]);

  return {
    user,
    token,
    isLoggedIn: isLoggedIn(),
    loading,
    error,
    login,
    logout,
    register,
  };
}
