'use client'

import { useEffect, useCallback } from 'react'
import { eventBus, PROPERTY_EVENTS } from '@/lib/utils/eventBus'

// Hook for property-specific events
export const usePropertyEvents = () => {
  // Listen for property events and trigger callbacks
  const onPropertyCreated = useCallback((callback: (propertyData: any) => void) => {
    const handlePropertyCreated = (event: CustomEvent) => {
      console.log('📡 usePropertyEvents: Property created event received:', event.detail)
      callback(event.detail)
    }

    eventBus.on(PROPERTY_EVENTS.CREATED, handlePropertyCreated)
    
    return () => {
      eventBus.off(PROPERTY_EVENTS.CREATED, handlePropertyCreated)
    }
  }, [])

  const onPropertyUpdated = useCallback((callback: (propertyId: string, propertyData: any) => void) => {
    const handlePropertyUpdated = (event: CustomEvent) => {
      console.log('📡 usePropertyEvents: Property updated event received:', event.detail)
      callback(event.detail.propertyId, event.detail.propertyData)
    }

    eventBus.on(PROPERTY_EVENTS.UPDATED, handlePropertyUpdated)
    
    return () => {
      eventBus.off(PROPERTY_EVENTS.UPDATED, handlePropertyUpdated)
    }
  }, [])

  const onPropertyDeleted = useCallback((callback: (propertyId: string) => void) => {
    const handlePropertyDeleted = (event: CustomEvent) => {
      console.log('📡 usePropertyEvents: Property deleted event received:', event.detail)
      callback(event.detail.propertyId)
    }

    eventBus.on(PROPERTY_EVENTS.DELETED, handlePropertyDeleted)
    
    return () => {
      eventBus.off(PROPERTY_EVENTS.DELETED, handlePropertyDeleted)
    }
  }, [])

  const onPropertyRefresh = useCallback((callback: () => void) => {
    const handlePropertyRefresh = (event: CustomEvent) => {
      console.log('📡 usePropertyEvents: Property refresh event received')
      callback()
    }

    eventBus.on(PROPERTY_EVENTS.REFRESH, handlePropertyRefresh)
    
    return () => {
      eventBus.off(PROPERTY_EVENTS.REFRESH, handlePropertyRefresh)
    }
  }, [])

  // Emit functions for property events
  const emitPropertyCreated = useCallback((propertyData: any) => {
    console.log('📡 usePropertyEvents: Emitting property created event:', propertyData)
    eventBus.emit(PROPERTY_EVENTS.CREATED, propertyData)
  }, [])

  const emitPropertyUpdated = useCallback((propertyId: string, propertyData: any) => {
    console.log('📡 usePropertyEvents: Emitting property updated event:', propertyId, propertyData)
    eventBus.emit(PROPERTY_EVENTS.UPDATED, { propertyId, propertyData })
  }, [])

  const emitPropertyDeleted = useCallback((propertyId: string) => {
    console.log('📡 usePropertyEvents: Emitting property deleted event:', propertyId)
    eventBus.emit(PROPERTY_EVENTS.DELETED, { propertyId })
  }, [])

  const emitPropertyRefresh = useCallback(() => {
    console.log('📡 usePropertyEvents: Emitting property refresh event')
    eventBus.emit(PROPERTY_EVENTS.REFRESH, {})
  }, [])

  return {
    // Event listeners
    onPropertyCreated,
    onPropertyUpdated,
    onPropertyDeleted,
    onPropertyRefresh,
    // Event emitters
    emitPropertyCreated,
    emitPropertyUpdated,
    emitPropertyDeleted,
    emitPropertyRefresh
  }
}

// Generic hook for subscribing to any event
export const useEventBusSubscription = (eventName: string, callback: (data: any) => void) => {
  useEffect(() => {
    const handleEvent = (event: CustomEvent) => {
      callback(event.detail)
    }

    eventBus.on(eventName, handleEvent)
    
    return () => {
      eventBus.off(eventName, handleEvent)
    }
  }, [eventName, callback])
}
