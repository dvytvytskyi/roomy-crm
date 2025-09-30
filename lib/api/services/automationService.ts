import { API_CONFIG } from '../config'

export interface AutoResponseSettings {
  isActive: boolean
  nonConfirmed: {
    firstMessage: string
    subsequentMessage: string
  }
  confirmed: {
    beforeCheckin: string
    checkinDay: string
    checkoutDay: string
    duringStay: string
    afterCheckout: string
  }
}

export interface AutoReviewsSettings {
  isActive: boolean
  delay: number
  rating: number
  template: string
}

export interface AutomationSettings {
  autoResponse: AutoResponseSettings
  autoReviews: AutoReviewsSettings
}

// Get automation settings for a property
export const getAutomationSettings = async (propertyId: string): Promise<AutomationSettings> => {
  try {
    console.log(`[AutomationService] Getting automation settings for property ${propertyId}`)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Try to get from localStorage first
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(`automationSettings_${propertyId}`)
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          console.log(`[AutomationService] Loaded from localStorage:`, parsed)
          return parsed
        } catch (error) {
          console.error('[AutomationService] Error parsing localStorage data:', error)
        }
      }
    }
    
    // Default settings
    const defaultSettings: AutomationSettings = {
      autoResponse: {
        isActive: true,
        nonConfirmed: {
          firstMessage: 'Thank you for your interest in our property! We will get back to you shortly with more information.',
          subsequentMessage: 'Thank you for your message. We are here to help with any questions you may have.'
        },
        confirmed: {
          beforeCheckin: 'Hello! Your check-in is tomorrow. We look forward to hosting you. Please let us know if you have any questions.',
          checkinDay: 'Welcome! We hope you have a wonderful stay. If you need anything, please don\'t hesitate to contact us.',
          checkoutDay: 'Thank you for staying with us! Check-out is today. We hope you had a great time.',
          duringStay: 'We hope you\'re enjoying your stay! If you need anything, please let us know.',
          afterCheckout: 'Thank you for staying with us! We hope you had a wonderful time. Please leave us a review if you enjoyed your stay.'
        }
      },
      autoReviews: {
        isActive: true,
        delay: 3,
        rating: 5,
        template: 'Thank you for staying with us! We hope you had a wonderful time and would love to hear about your experience.'
      }
    }
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`automationSettings_${propertyId}`, JSON.stringify(defaultSettings))
    }
    
    console.log(`[AutomationService] Created default settings:`, defaultSettings)
    return defaultSettings
    
  } catch (error) {
    console.error('[AutomationService] Error getting automation settings:', error)
    throw error
  }
}

// Update auto response settings
export const updateAutoResponseSettings = async (propertyId: string, settings: AutoResponseSettings): Promise<AutoResponseSettings> => {
  try {
    console.log(`[AutomationService] Updating auto response settings:`, settings)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Get current settings
    const currentSettings = await getAutomationSettings(propertyId)
    
    // Update auto response settings
    const updatedSettings = {
      ...currentSettings,
      autoResponse: settings
    }
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`automationSettings_${propertyId}`, JSON.stringify(updatedSettings))
    }
    
    console.log(`[AutomationService] Updated auto response settings successfully`)
    return settings
    
  } catch (error) {
    console.error('[AutomationService] Error updating auto response settings:', error)
    throw error
  }
}

// Update auto reviews settings
export const updateAutoReviewsSettings = async (propertyId: string, settings: AutoReviewsSettings): Promise<AutoReviewsSettings> => {
  try {
    console.log(`[AutomationService] Updating auto reviews settings:`, settings)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Get current settings
    const currentSettings = await getAutomationSettings(propertyId)
    
    // Update auto reviews settings
    const updatedSettings = {
      ...currentSettings,
      autoReviews: settings
    }
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`automationSettings_${propertyId}`, JSON.stringify(updatedSettings))
    }
    
    console.log(`[AutomationService] Updated auto reviews settings successfully`)
    return settings
    
  } catch (error) {
    console.error('[AutomationService] Error updating auto reviews settings:', error)
    throw error
  }
}

// Update specific auto response message
export const updateAutoResponseMessage = async (
  propertyId: string, 
  type: 'nonConfirmed' | 'confirmed', 
  trigger: string, 
  content: string
): Promise<void> => {
  try {
    console.log(`[AutomationService] Updating auto response message for ${type}.${trigger}`)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Get current settings
    const currentSettings = await getAutomationSettings(propertyId)
    console.log(`[AutomationService] Current settings before update:`, currentSettings)
    
    // Update the specific message
    if (type === 'nonConfirmed') {
      if (trigger === 'first-message') {
        currentSettings.autoResponse.nonConfirmed.firstMessage = content
      } else if (trigger === 'subsequent') {
        currentSettings.autoResponse.nonConfirmed.subsequentMessage = content
      }
    } else if (type === 'confirmed') {
      switch (trigger) {
        case 'before-checkin':
          currentSettings.autoResponse.confirmed.beforeCheckin = content
          break
        case 'checkin-day':
          currentSettings.autoResponse.confirmed.checkinDay = content
          break
        case 'checkout-day':
          currentSettings.autoResponse.confirmed.checkoutDay = content
          break
        case 'during-stay':
          currentSettings.autoResponse.confirmed.duringStay = content
          break
        case 'after-checkout':
          currentSettings.autoResponse.confirmed.afterCheckout = content
          break
      }
    }
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`automationSettings_${propertyId}`, JSON.stringify(currentSettings))
      console.log(`[AutomationService] Saved to localStorage:`, currentSettings)
    }
    
    console.log(`[AutomationService] Updated auto response message successfully`)
    
  } catch (error) {
    console.error('[AutomationService] Error updating auto response message:', error)
    throw error
  }
}

// Toggle auto response activation
export const toggleAutoResponse = async (propertyId: string, isActive: boolean): Promise<void> => {
  try {
    console.log(`[AutomationService] Toggling auto response to ${isActive}`)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Get current settings
    const currentSettings = await getAutomationSettings(propertyId)
    
    // Update activation status
    currentSettings.autoResponse.isActive = isActive
    
    // Save to localStorage
    localStorage.setItem(`automationSettings_${propertyId}`, JSON.stringify(currentSettings))
    
    console.log(`[AutomationService] Toggled auto response successfully`)
    
  } catch (error) {
    console.error('[AutomationService] Error toggling auto response:', error)
    throw error
  }
}

// Toggle auto reviews activation
export const toggleAutoReviews = async (propertyId: string, isActive: boolean): Promise<void> => {
  try {
    console.log(`[AutomationService] Toggling auto reviews to ${isActive}`)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Get current settings
    const currentSettings = await getAutomationSettings(propertyId)
    
    // Update activation status
    currentSettings.autoReviews.isActive = isActive
    
    // Save to localStorage
    localStorage.setItem(`automationSettings_${propertyId}`, JSON.stringify(currentSettings))
    
    console.log(`[AutomationService] Toggled auto reviews successfully`)
    
  } catch (error) {
    console.error('[AutomationService] Error toggling auto reviews:', error)
    throw error
  }
}

// Test automation settings
export const testAutomationSettings = async (propertyId: string, type: 'autoResponse' | 'autoReviews'): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`[AutomationService] Testing ${type} settings for property ${propertyId}`)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log(`[AutomationService] Test completed successfully`)
    return {
      success: true,
      message: `${type === 'autoResponse' ? 'Auto response' : 'Auto reviews'} settings tested successfully`
    }
    
  } catch (error) {
    console.error('[AutomationService] Error testing automation settings:', error)
    return {
      success: false,
      message: `Failed to test ${type} settings. Please try again.`
    }
  }
}
