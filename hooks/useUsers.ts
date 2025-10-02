import { useState, useEffect, useCallback, useRef } from 'react';
import { userService, User, UserStats, OwnerStats, AgentStats, GuestStats, UsersResponse } from '@/lib/api';
import { useApi, useApiMutation } from './useApi';
import { FilterParams, PaginationParams } from '@/lib/api';

export function useUsers(filters: FilterParams & PaginationParams = {}) {
  return useApi<UsersResponse>(
    () => userService.getUsers(filters),
    { immediate: true }
  );
}

export function useOwners(filters: FilterParams & PaginationParams = {}) {
  const prevFiltersRef = useRef<string>('')
  
  const apiCall = useCallback(() => {
    const filtersString = JSON.stringify(filters)
    if (prevFiltersRef.current === filtersString) {
      console.log('🔄 useOwners: Skipping duplicate API call')
      return Promise.resolve({ success: true, data: null })
    }
    
    prevFiltersRef.current = filtersString
    console.log('📞 useOwners API call with filters:', filters)
    return userService.getOwners(filters)
  }, [
    filters.search,
    filters.page,
    filters.limit,
    filters.nationality,
    filters.isActive,
    filters.dateOfBirthFrom,
    filters.dateOfBirthTo,
    filters.phoneNumber,
    filters.comments
  ])
  
  return useApi<UsersResponse>(apiCall, { immediate: true });
}

export function useAgents(filters: FilterParams & PaginationParams = {}) {
  return useApi<UsersResponse>(
    () => userService.getAgents(filters),
    { immediate: true }
  );
}

export function useGuests(filters: FilterParams & PaginationParams = {}) {
  return useApi<UsersResponse>(
    () => userService.getGuests(filters),
    { immediate: true }
  );
}

export function useUserStats() {
  const hasCalledRef = useRef(false)
  
  const apiCall = useCallback(() => {
    if (hasCalledRef.current) {
      console.log('🔄 useUserStats: Skipping duplicate API call')
      return Promise.resolve({ success: true, data: null })
    }
    
    hasCalledRef.current = true
    console.log('📊 useUserStats API call')
    return userService.getUserStats()
  }, [])
  
  return useApi<UserStats>(apiCall, { immediate: true });
}

export function useOwnerStats(ownerId: string) {
  return useApi<OwnerStats>(
    () => userService.getOwnerStats(ownerId),
    { immediate: !!ownerId }
  );
}

export function useAgentStats(agentId: string) {
  return useApi<AgentStats>(
    () => userService.getAgentStats(agentId),
    { immediate: !!agentId }
  );
}

export function useGuestStats(guestId: string) {
  return useApi<GuestStats>(
    () => userService.getGuestStats(guestId),
    { immediate: !!guestId }
  );
}

export function useUserById(id: string) {
  return useApi<User>(
    () => userService.getUserById(id),
    { immediate: !!id }
  );
}

export function useUpdateUser() {
  return useApiMutation<User, { id: string; userData: Partial<User> }>(
    ({ id, userData }) => userService.updateUser(id, userData)
  );
}

export function useActivateUser() {
  return useApiMutation<User, string>(
    (id) => userService.activateUser(id)
  );
}

export function useDeactivateUser() {
  return useApiMutation<User, string>(
    (id) => userService.deactivateUser(id)
  );
}
