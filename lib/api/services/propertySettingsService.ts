import { API_CONFIG } from '../config'

export interface PropertySettings {
  amenities: string[]
  selectedAmenities: string[]
  rules: string[]
  selectedRules: string[]
  utilities: Array<{
    title: string
    description: string
  }>
}

export const propertySettingsService = {
  // Отримати налаштування властивості
  getPropertySettings: async (propertyId: string): Promise<PropertySettings> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/properties/${propertyId}/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.settings
    } catch (error) {
      console.error('Error fetching property settings:', error)
      // Повертаємо з localStorage як fallback
      return propertySettingsService.loadFromLocalStorage(propertyId)
    }
  },

  // Оновити amenities
  updateAmenities: async (propertyId: string, amenities: string[], selectedAmenities: string[]): Promise<PropertySettings> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/properties/${propertyId}/amenities`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amenities, selectedAmenities })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.settings
    } catch (error) {
      console.error('Error updating amenities:', error)
      throw error
    }
  },

  // Оновити rules
  updateRules: async (propertyId: string, rules: string[], selectedRules: string[]): Promise<PropertySettings> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/properties/${propertyId}/rules`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rules, selectedRules })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.settings
    } catch (error) {
      console.error('Error updating rules:', error)
      throw error
    }
  },

  // Оновити utilities
  updateUtilities: async (propertyId: string, utilities: Array<{ title: string; description: string }>): Promise<PropertySettings> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/properties/${propertyId}/utilities`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ utilities })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.settings
    } catch (error) {
      console.error('Error updating utilities:', error)
      throw error
    }
  },

  // Додати новий utility
  addUtility: async (propertyId: string, utility: { title: string; description: string }): Promise<PropertySettings> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/properties/${propertyId}/utilities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(utility)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.settings
    } catch (error) {
      console.error('Error adding utility:', error)
      throw error
    }
  },

  // Видалити utility
  deleteUtility: async (propertyId: string, utilityIndex: number): Promise<PropertySettings> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/properties/${propertyId}/utilities/${utilityIndex}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.settings
    } catch (error) {
      console.error('Error deleting utility:', error)
      throw error
    }
  },

  // Зберегти в localStorage
  saveToLocalStorage: (propertyId: string, settings: Partial<PropertySettings>) => {
    if (settings.amenities) {
      localStorage.setItem(`propertyAmenities_${propertyId}`, JSON.stringify(settings.amenities))
    }
    if (settings.selectedAmenities) {
      localStorage.setItem(`propertySelectedAmenities_${propertyId}`, JSON.stringify(settings.selectedAmenities))
    }
    if (settings.rules) {
      localStorage.setItem(`propertyRules_${propertyId}`, JSON.stringify(settings.rules))
    }
    if (settings.selectedRules) {
      localStorage.setItem(`propertySelectedRules_${propertyId}`, JSON.stringify(settings.selectedRules))
    }
    if (settings.utilities) {
      localStorage.setItem(`propertyUtilities_${propertyId}`, JSON.stringify(settings.utilities))
    }
  },

  // Завантажити з localStorage
  loadFromLocalStorage: (propertyId: string): PropertySettings => {
    const amenities = JSON.parse(localStorage.getItem(`propertyAmenities_${propertyId}`) || '[]')
    const selectedAmenities = JSON.parse(localStorage.getItem(`propertySelectedAmenities_${propertyId}`) || '[]')
    const rules = JSON.parse(localStorage.getItem(`propertyRules_${propertyId}`) || '[]')
    const selectedRules = JSON.parse(localStorage.getItem(`propertySelectedRules_${propertyId}`) || '[]')
    const utilities = JSON.parse(localStorage.getItem(`propertyUtilities_${propertyId}`) || '[]')

    return {
      amenities,
      selectedAmenities,
      rules,
      selectedRules,
      utilities
    }
  }
}
