import { API_CONFIG } from '../config'

export interface SavedReply {
  id: string
  name: string
  content: string
  category: 'single' | 'multiple'
  propertyId?: string
  createdAt: string
  updatedAt: string
}

export interface SavedReplyCategory {
  id: string
  name: string
  replies: SavedReply[]
}

// Get all saved replies for a property
export const getSavedReplies = async (propertyId: string): Promise<SavedReplyCategory[]> => {
  try {
    console.log(`[SavedRepliesService] Getting saved replies for property ${propertyId}`)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Try to get from localStorage first
    const savedData = localStorage.getItem(`savedReplies_${propertyId}`)
    if (savedData) {
      const parsed = JSON.parse(savedData)
      console.log(`[SavedRepliesService] Loaded from localStorage:`, parsed)
      return parsed
    }
    
    // Default structure
    const defaultReplies: SavedReplyCategory[] = [
      {
        id: 'single',
        name: 'REPLIES SAVED FOR JUST THIS LISTING',
        replies: [
          {
            id: 'info',
            name: 'INFO',
            content: 'Welcome to our property! Here you will find all the important information about your stay...',
            category: 'single',
            propertyId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      },
      {
        id: 'multiple',
        name: 'REPLIES SAVED FOR THIS LISTING AND OTHER LISTINGS',
        replies: [
          {
            id: 'after-checkin',
            name: 'AFTER CHECK IN',
            content: 'Thank you for checking in! We hope you have a wonderful stay. If you need anything, please don\'t hesitate to contact us.',
            category: 'multiple',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'after-checkout',
            name: 'AFTER CHECK OUT',
            content: 'Thank you for staying with us! We hope you had a great time. Please leave us a review if you enjoyed your stay.',
            category: 'multiple',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'before-checkout',
            name: 'BEFORE CHECK OUT',
            content: 'Your checkout is tomorrow. Please remember to check out by 11 AM. We hope you enjoyed your stay!',
            category: 'multiple',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'just-booked',
            name: 'JUST BOOKED',
            content: 'Thank you for your booking! We\'re excited to host you. Check-in information will be sent closer to your arrival date.',
            category: 'multiple',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'key-card',
            name: 'KEY & CARD',
            content: 'Your key and access card are ready for pickup. Please contact us to arrange collection.',
            category: 'multiple',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      }
    ]
    
    // Save to localStorage
    localStorage.setItem(`savedReplies_${propertyId}`, JSON.stringify(defaultReplies))
    
    console.log(`[SavedRepliesService] Created default replies:`, defaultReplies)
    return defaultReplies
    
  } catch (error) {
    console.error('[SavedRepliesService] Error getting saved replies:', error)
    throw error
  }
}

// Add new saved reply
export const addSavedReply = async (propertyId: string, reply: Omit<SavedReply, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavedReply> => {
  try {
    console.log(`[SavedRepliesService] Adding new saved reply:`, reply)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newReply: SavedReply = {
      ...reply,
      id: `reply_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Get current replies
    const currentReplies = await getSavedReplies(propertyId)
    
    // Find the category and add the reply
    const categoryIndex = currentReplies.findIndex(cat => cat.id === reply.category)
    if (categoryIndex !== -1) {
      currentReplies[categoryIndex].replies.push(newReply)
    } else {
      // Create new category if it doesn't exist
      currentReplies.push({
        id: reply.category,
        name: reply.category === 'single' ? 'REPLIES SAVED FOR JUST THIS LISTING' : 'REPLIES SAVED FOR THIS LISTING AND OTHER LISTINGS',
        replies: [newReply]
      })
    }
    
    // Save to localStorage
    localStorage.setItem(`savedReplies_${propertyId}`, JSON.stringify(currentReplies))
    
    console.log(`[SavedRepliesService] Added reply successfully:`, newReply)
    return newReply
    
  } catch (error) {
    console.error('[SavedRepliesService] Error adding saved reply:', error)
    throw error
  }
}

// Update saved reply
export const updateSavedReply = async (propertyId: string, replyId: string, updates: Partial<SavedReply>): Promise<SavedReply> => {
  try {
    console.log(`[SavedRepliesService] Updating saved reply ${replyId}:`, updates)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Get current replies
    const currentReplies = await getSavedReplies(propertyId)
    
    // Find and update the reply
    let updatedReply: SavedReply | null = null
    for (const category of currentReplies) {
      const replyIndex = category.replies.findIndex(reply => reply.id === replyId)
      if (replyIndex !== -1) {
        category.replies[replyIndex] = {
          ...category.replies[replyIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        updatedReply = category.replies[replyIndex]
        break
      }
    }
    
    if (!updatedReply) {
      throw new Error('Reply not found')
    }
    
    // Save to localStorage
    localStorage.setItem(`savedReplies_${propertyId}`, JSON.stringify(currentReplies))
    
    console.log(`[SavedRepliesService] Updated reply successfully:`, updatedReply)
    return updatedReply
    
  } catch (error) {
    console.error('[SavedRepliesService] Error updating saved reply:', error)
    throw error
  }
}

// Delete saved reply
export const deleteSavedReply = async (propertyId: string, replyId: string): Promise<void> => {
  try {
    console.log(`[SavedRepliesService] Deleting saved reply ${replyId}`)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Get current replies
    const currentReplies = await getSavedReplies(propertyId)
    
    // Find and remove the reply
    for (const category of currentReplies) {
      const replyIndex = category.replies.findIndex(reply => reply.id === replyId)
      if (replyIndex !== -1) {
        category.replies.splice(replyIndex, 1)
        break
      }
    }
    
    // Save to localStorage
    localStorage.setItem(`savedReplies_${propertyId}`, JSON.stringify(currentReplies))
    
    console.log(`[SavedRepliesService] Deleted reply successfully`)
    
  } catch (error) {
    console.error('[SavedRepliesService] Error deleting saved reply:', error)
    throw error
  }
}

// Sync with external platforms
export const syncSavedReplies = async (propertyId: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`[SavedRepliesService] Syncing saved replies for property ${propertyId}`)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log(`[SavedRepliesService] Sync completed successfully`)
    return {
      success: true,
      message: 'All saved replies have been synchronized with Airbnb, Booking.com, and other channels'
    }
    
  } catch (error) {
    console.error('[SavedRepliesService] Error syncing saved replies:', error)
    return {
      success: false,
      message: 'Failed to sync saved replies. Please try again.'
    }
  }
}
