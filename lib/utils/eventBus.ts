// Simple Event Bus for state synchronization across components
type EventCallback = (data?: any) => void;

class EventBus {
  private events: { [key: string]: EventCallback[] } = {};

  // Subscribe to an event
  on(event: string, callback: EventCallback): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  // Emit an event
  emit(event: string, data?: any): void {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  // Remove all listeners for an event
  off(event: string): void {
    delete this.events[event];
  }

  // Remove all listeners
  clear(): void {
    this.events = {};
  }
}

// Create singleton instance
export const eventBus = new EventBus();

// Event types for better type safety
export const GUEST_EVENTS = {
  UPDATED: 'guest:updated',
  CREATED: 'guest:created',
  DELETED: 'guest:deleted',
  REFRESH: 'guest:refresh'
} as const;

export const USER_EVENTS = {
  UPDATED: 'user:updated',
  CREATED: 'user:created',
  DELETED: 'user:deleted',
  REFRESH: 'user:refresh'
} as const;

export const PROPERTY_EVENTS = {
  UPDATED: 'property:updated',
  CREATED: 'property:created',
  DELETED: 'property:deleted',
  REFRESH: 'property:refresh'
} as const;

export const RESERVATION_EVENTS = {
  UPDATED: 'reservation:updated',
  CREATED: 'reservation:created',
  DELETED: 'reservation:deleted',
  REFRESH: 'reservation:refresh'
} as const;

// Helper functions for common operations
export const emitGuestUpdated = (guestId: string, guestData?: any) => {
  eventBus.emit(GUEST_EVENTS.UPDATED, { guestId, guestData });
};

export const emitGuestCreated = (guestData: any) => {
  eventBus.emit(GUEST_EVENTS.CREATED, { guestData });
};

export const emitGuestDeleted = (guestId: string) => {
  eventBus.emit(GUEST_EVENTS.DELETED, { guestId });
};

export const emitGuestRefresh = () => {
  eventBus.emit(GUEST_EVENTS.REFRESH);
};

// React hook for event subscription
export const useEventBus = () => {
  const subscribe = (event: string, callback: EventCallback) => {
    return eventBus.on(event, callback);
  };

  const emit = (event: string, data?: any) => {
    eventBus.emit(event, data);
  };

  return { subscribe, emit };
};

export default eventBus;
