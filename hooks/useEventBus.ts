import { useEffect, useCallback } from 'react';
import { eventBus, EventCallback } from '@/lib/utils/eventBus';

// Hook for subscribing to events with automatic cleanup
export const useEventBusSubscription = (event: string, callback: EventCallback, deps: any[] = []) => {
  useEffect(() => {
    const unsubscribe = eventBus.on(event, callback);
    return unsubscribe;
  }, [event, ...deps]);
};

// Hook for emitting events
export const useEventBusEmitter = () => {
  const emit = useCallback((event: string, data?: any) => {
    eventBus.emit(event, data);
  }, []);

  return { emit };
};

// Hook for guest-specific events
export const useGuestEvents = () => {
  const emitGuestUpdated = useCallback((guestId: string, guestData?: any) => {
    eventBus.emit('guest:updated', { guestId, guestData });
  }, []);

  const emitGuestCreated = useCallback((guestData: any) => {
    eventBus.emit('guest:created', { guestData });
  }, []);

  const emitGuestDeleted = useCallback((guestId: string) => {
    eventBus.emit('guest:deleted', { guestId });
  }, []);

  const emitGuestRefresh = useCallback(() => {
    eventBus.emit('guest:refresh');
  }, []);

  const onGuestUpdated = useCallback((callback: (data: { guestId: string; guestData?: any }) => void) => {
    return eventBus.on('guest:updated', callback);
  }, []);

  const onGuestCreated = useCallback((callback: (data: { guestData: any }) => void) => {
    return eventBus.on('guest:created', callback);
  }, []);

  const onGuestDeleted = useCallback((callback: (data: { guestId: string }) => void) => {
    return eventBus.on('guest:deleted', callback);
  }, []);

  const onGuestRefresh = useCallback((callback: () => void) => {
    return eventBus.on('guest:refresh', callback);
  }, []);

  return {
    emitGuestUpdated,
    emitGuestCreated,
    emitGuestDeleted,
    emitGuestRefresh,
    onGuestUpdated,
    onGuestCreated,
    onGuestDeleted,
    onGuestRefresh,
  };
};

// Hook for user-specific events
export const useUserEvents = () => {
  const emitUserUpdated = useCallback((userId: string, userData?: any) => {
    eventBus.emit('user:updated', { userId, userData });
  }, []);

  const emitUserCreated = useCallback((userData: any) => {
    eventBus.emit('user:created', { userData });
  }, []);

  const emitUserDeleted = useCallback((userId: string) => {
    eventBus.emit('user:deleted', { userId });
  }, []);

  const emitUserRefresh = useCallback(() => {
    eventBus.emit('user:refresh');
  }, []);

  const onUserUpdated = useCallback((callback: (data: { userId: string; userData?: any }) => void) => {
    return eventBus.on('user:updated', callback);
  }, []);

  const onUserCreated = useCallback((callback: (data: { userData: any }) => void) => {
    return eventBus.on('user:created', callback);
  }, []);

  const onUserDeleted = useCallback((callback: (data: { userId: string }) => void) => {
    return eventBus.on('user:deleted', callback);
  }, []);

  const onUserRefresh = useCallback((callback: () => void) => {
    return eventBus.on('user:refresh', callback);
  }, []);

  return {
    emitUserUpdated,
    emitUserCreated,
    emitUserDeleted,
    emitUserRefresh,
    onUserUpdated,
    onUserCreated,
    onUserDeleted,
    onUserRefresh,
  };
};

// Hook for agent-specific events
export const useAgentEvents = () => {
  const emitAgentUpdated = useCallback((agentId: string, agentData?: any) => {
    eventBus.emit('agent:updated', { agentId, agentData });
  }, []);

  const emitAgentCreated = useCallback((agentData: any) => {
    eventBus.emit('agent:created', { agentData });
  }, []);

  const emitAgentDeleted = useCallback((agentId: string) => {
    eventBus.emit('agent:deleted', { agentId });
  }, []);

  const emitAgentRefresh = useCallback(() => {
    eventBus.emit('agent:refresh');
  }, []);

  const onAgentUpdated = useCallback((callback: (data: { agentId: string; agentData?: any }) => void) => {
    return eventBus.on('agent:updated', callback);
  }, []);

  const onAgentCreated = useCallback((callback: (data: { agentData: any }) => void) => {
    return eventBus.on('agent:created', callback);
  }, []);

  const onAgentDeleted = useCallback((callback: (data: { agentId: string }) => void) => {
    return eventBus.on('agent:deleted', callback);
  }, []);

  const onAgentRefresh = useCallback((callback: () => void) => {
    return eventBus.on('agent:refresh', callback);
  }, []);

  return {
    emitAgentUpdated,
    emitAgentCreated,
    emitAgentDeleted,
    emitAgentRefresh,
    onAgentUpdated,
    onAgentCreated,
    onAgentDeleted,
    onAgentRefresh,
  };
};

export default useEventBusSubscription;
