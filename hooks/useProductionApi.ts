import { useState, useEffect, useCallback } from 'react';
import { productionService } from '@/lib/api/services/productionService';
import { debugLog } from '@/lib/api/production-utils';

/**
 * Production API Hook
 * 
 * This hook provides a unified interface for interacting with the production API.
 * It handles authentication, error handling, and provides consistent data fetching patterns.
 */

interface UseProductionApiOptions {
  autoFetch?: boolean;
  dependencies?: any[];
}

interface UseProductionApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

// Generic hook for any API endpoint
export function useProductionApi<T>(
  fetchFn: () => Promise<any>,
  options: UseProductionApiOptions = {}
): UseProductionApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      debugLog('Fetching data via production API...');
      const response = await fetchFn();
      
      if (response.success) {
        setData(response.data);
        debugLog('Data fetched successfully:', response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch data');
        debugLog('API error:', response.error);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      debugLog('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData, ...(options.dependencies || [])]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    mutate
  };
}

// Specialized hooks for specific entities

export function useUsers(params?: any) {
  return useProductionApi(
    () => productionService.getUsers(params),
    { autoFetch: true }
  );
}

export function useUser(userId: string) {
  return useProductionApi(
    () => productionService.getUser(userId),
    { autoFetch: !!userId, dependencies: [userId] }
  );
}

export function useProperties(params?: any) {
  return useProductionApi(
    () => productionService.getProperties(params),
    { autoFetch: true }
  );
}

export function useProperty(propertyId: string) {
  return useProductionApi(
    () => productionService.getProperty(propertyId),
    { autoFetch: !!propertyId, dependencies: [propertyId] }
  );
}

export function useReservations(params?: any) {
  return useProductionApi(
    () => productionService.getReservations(params),
    { autoFetch: true }
  );
}

export function useReservation(reservationId: string) {
  return useProductionApi(
    () => productionService.getReservation(reservationId),
    { autoFetch: !!reservationId, dependencies: [reservationId] }
  );
}

export function useTasks(params?: any) {
  return useProductionApi(
    () => productionService.getTasks(params),
    { autoFetch: true }
  );
}

export function useTask(taskId: string) {
  return useProductionApi(
    () => productionService.getTask(taskId),
    { autoFetch: !!taskId, dependencies: [taskId] }
  );
}

export function useTransactions(params?: any) {
  return useProductionApi(
    () => productionService.getTransactions(params),
    { autoFetch: true }
  );
}

export function useTransaction(transactionId: string) {
  return useProductionApi(
    () => productionService.getTransaction(transactionId),
    { autoFetch: !!transactionId, dependencies: [transactionId] }
  );
}

export function useLocations(params?: any) {
  return useProductionApi(
    () => productionService.getLocations(params),
    { autoFetch: true }
  );
}

export function useLocation(locationId: string) {
  return useProductionApi(
    () => productionService.getLocation(locationId),
    { autoFetch: !!locationId, dependencies: [locationId] }
  );
}

export function useSystemSettings(category?: string) {
  return useProductionApi(
    () => productionService.getSystemSettings(category),
    { autoFetch: true, dependencies: [category] }
  );
}

export function useFinancialSummary(params?: any) {
  return useProductionApi(
    () => productionService.getFinancialSummary(params),
    { autoFetch: true, dependencies: [params] }
  );
}

export function useIncomeDistribution(params?: any) {
  return useProductionApi(
    () => productionService.getIncomeDistribution(params),
    { autoFetch: true, dependencies: [params] }
  );
}

// Mutation hooks for data modification

export function useCreateUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = useCallback(async (userData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      debugLog('Creating user via production API...');
      const response = await productionService.createUser(userData);
      
      if (response.success) {
        debugLog('User created successfully:', response.data);
        return response.data;
      } else {
        setError(response.error?.message || 'Failed to create user');
        debugLog('Create user error:', response.error);
        throw new Error(response.error?.message || 'Failed to create user');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      debugLog('Create user error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createUser, isLoading, error };
}

export function useUpdateUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = useCallback(async (userId: string, userData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      debugLog('Updating user via production API...');
      const response = await productionService.updateUser(userId, userData);
      
      if (response.success) {
        debugLog('User updated successfully:', response.data);
        return response.data;
      } else {
        setError(response.error?.message || 'Failed to update user');
        debugLog('Update user error:', response.error);
        throw new Error(response.error?.message || 'Failed to update user');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      debugLog('Update user error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateUser, isLoading, error };
}

export function useCreateProperty() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProperty = useCallback(async (propertyData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      debugLog('Creating property via production API...');
      const response = await productionService.createProperty(propertyData);
      
      if (response.success) {
        debugLog('Property created successfully:', response.data);
        return response.data;
      } else {
        setError(response.error?.message || 'Failed to create property');
        debugLog('Create property error:', response.error);
        throw new Error(response.error?.message || 'Failed to create property');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      debugLog('Create property error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createProperty, isLoading, error };
}

export function useUpdateProperty() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProperty = useCallback(async (propertyId: string, propertyData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      debugLog('Updating property via production API...');
      const response = await productionService.updateProperty(propertyId, propertyData);
      
      if (response.success) {
        debugLog('Property updated successfully:', response.data);
        return response.data;
      } else {
        setError(response.error?.message || 'Failed to update property');
        debugLog('Update property error:', response.error);
        throw new Error(response.error?.message || 'Failed to update property');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      debugLog('Update property error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateProperty, isLoading, error };
}

export function useCreateReservation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReservation = useCallback(async (reservationData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      debugLog('Creating reservation via production API...');
      const response = await productionService.createReservation(reservationData);
      
      if (response.success) {
        debugLog('Reservation created successfully:', response.data);
        return response.data;
      } else {
        setError(response.error?.message || 'Failed to create reservation');
        debugLog('Create reservation error:', response.error);
        throw new Error(response.error?.message || 'Failed to create reservation');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      debugLog('Create reservation error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createReservation, isLoading, error };
}

export function useCreateTask() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTask = useCallback(async (taskData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      debugLog('Creating task via production API...');
      const response = await productionService.createTask(taskData);
      
      if (response.success) {
        debugLog('Task created successfully:', response.data);
        return response.data;
      } else {
        setError(response.error?.message || 'Failed to create task');
        debugLog('Create task error:', response.error);
        throw new Error(response.error?.message || 'Failed to create task');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      debugLog('Create task error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createTask, isLoading, error };
}

// Health check hook
export function useHealthCheck() {
  return useProductionApi(
    () => productionService.healthCheck(),
    { autoFetch: true }
  );
}
