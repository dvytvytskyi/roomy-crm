import { useState, useEffect, useCallback } from 'react';
import { authService, LoginRequest, RegisterRequest, User } from '@/lib/api';
import { useApiMutation } from './useApi';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const response = await authService.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear auth state
            await authService.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // No token, user is not authenticated
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      console.log('🔐 useAuth: Starting login...')
      const response = await authService.login(credentials);
      console.log('📋 useAuth: API response:', response)
      
      if (response.success && response.data) {
        console.log('✅ useAuth: Setting user and auth state...')
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log('🎯 useAuth: Auth state updated, user:', response.data.user)
        return { success: true, data: response.data };
      } else {
        console.log('❌ useAuth: Login failed:', response.error)
        return { success: false, error: response.error?.message || 'Login failed' };
      }
    } catch (error) {
      console.error('💥 useAuth: Login error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      const response = await authService.register(userData);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error?.message || 'Registration failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    register,
    logout,
  };
}

export function useLogin() {
  return useApiMutation<any, LoginRequest>(
    (credentials) => authService.login(credentials)
  );
}

export function useRegister() {
  return useApiMutation<any, RegisterRequest>(
    (userData) => authService.register(userData)
  );
}
