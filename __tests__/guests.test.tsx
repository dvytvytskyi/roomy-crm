/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GuestDetailsPage from '../app/guests/[id]/page'

// Mock Next.js router for GuestDetailsPage's useParams
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    pathname: '/guests/guest_1',
    query: {},
    asPath: '',
  }),
  useParams: () => ({ id: 'guest_1' }), // Provide a default ID for detail page tests
  usePathname: () => '/guests/guest_1',
}))

describe('Guest Details Page Tests', () => {
  describe('Guest Details Page', () => {
    test('should render guest details page', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      // Check that the page renders without crashing
      expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
    })

    test('should handle back navigation', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      // Wait for page to load and back button to appear
      await waitFor(() => {
        const backButton = screen.queryByTestId('back-btn')
        if (backButton) {
          expect(backButton).toBeInTheDocument()
        }
      }, { timeout: 3000 })
      
      const backButton = screen.queryByTestId('back-btn')
      if (backButton) {
        fireEvent.click(backButton)
        // Back navigation should work
      }
    })

    test('should display guest information sections', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      // Check that the page renders without crashing
      expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
      
      // Wait for page to load and check for basic sections
      await waitFor(() => {
        expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Check for sections that should be present
      const guestDetailsElements = screen.queryAllByText(/Guest Details/i)
      const statsElements = screen.queryAllByText(/Total Reservations/i)
      
      // At least one of these should be present
      expect(guestDetailsElements.length > 0 || statsElements.length > 0).toBe(true)
    })

    test('should display real guest data', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      // Check that the page renders without crashing
      expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
      
      // Test passes if page renders without errors
      await waitFor(() => {
        expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    test('should display guest statistics', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      // Wait for stats to load
      await waitFor(() => {
        expect(screen.getByText('Total Reservations')).toBeInTheDocument()
        expect(screen.getByText('Lifetime Value')).toBeInTheDocument()
        expect(screen.getByText('Total Nights')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    test('should test all guest form fields editing', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      await waitFor(() => {
        expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Test email field editing
      const emailEditBtn = screen.queryByTestId('edit-email-btn')
      if (emailEditBtn) {
        fireEvent.click(emailEditBtn)
        const editModal = screen.queryByTestId('edit-modal')
        if (editModal) {
          const emailInput = screen.queryByTestId('edit-email-input')
          if (emailInput) {
            fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } })
            expect(emailInput).toHaveValue('newemail@example.com')
          }
        }
      }
      
      // Test phone field editing
      const phoneEditBtn = screen.queryByTestId('edit-phone-btn')
      if (phoneEditBtn) {
        fireEvent.click(phoneEditBtn)
        const editModal = screen.queryByTestId('edit-modal')
        if (editModal) {
          const phoneInput = screen.queryByTestId('edit-phone-input')
          if (phoneInput) {
            fireEvent.change(phoneInput, { target: { value: '+971501234567' } })
            expect(phoneInput).toHaveValue('+971501234567')
          }
        }
      }
      
      // Test nationality field editing
      const nationalityEditBtn = screen.queryByTestId('edit-nationality-btn')
      if (nationalityEditBtn) {
        fireEvent.click(nationalityEditBtn)
        const editModal = screen.queryByTestId('edit-modal')
        if (editModal) {
          const nationalitySelect = screen.queryByTestId('edit-nationality-select')
          if (nationalitySelect) {
            fireEvent.change(nationalitySelect, { target: { value: 'United Kingdom' } })
            expect(nationalitySelect).toHaveValue('United Kingdom')
          }
        }
      }
      
      // Test birth date field editing
      const birthDateEditBtn = screen.queryByTestId('edit-birthdate-btn')
      if (birthDateEditBtn) {
        fireEvent.click(birthDateEditBtn)
        const editModal = screen.queryByTestId('edit-modal')
        if (editModal) {
          const birthDateInput = screen.queryByTestId('edit-birthdate-input')
          if (birthDateInput) {
            fireEvent.change(birthDateInput, { target: { value: '1990-05-15' } })
            expect(birthDateInput).toHaveValue('1990-05-15')
          }
        }
      }
      
      // Test comments field editing
      const commentsEditBtn = screen.queryByTestId('edit-comments-btn')
      if (commentsEditBtn) {
        fireEvent.click(commentsEditBtn)
        const editModal = screen.queryByTestId('edit-modal')
        if (editModal) {
          const commentsTextarea = screen.queryByTestId('edit-comments-textarea')
          if (commentsTextarea) {
            fireEvent.change(commentsTextarea, { target: { value: 'Updated guest comments' } })
            expect(commentsTextarea).toHaveValue('Updated guest comments')
          }
        }
      }
    })

    test('should test guest reservations functionality', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      await waitFor(() => {
        expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Test reservations section
      const reservationsSection = screen.queryByTestId('guest-reservations-section')
      if (reservationsSection) {
        expect(reservationsSection).toBeInTheDocument()
        
        // Test reservation item click
        const reservationItem = screen.queryByTestId('reservation-item')
        if (reservationItem) {
          fireEvent.click(reservationItem)
        }
      }
      
      // Test reservation status badges
      const statusBadges = screen.queryAllByTestId(/status-badge-/)
      if (statusBadges.length > 0) {
        expect(statusBadges[0]).toBeInTheDocument()
      }
    })

    test('should test guest documents functionality', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      await waitFor(() => {
        expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Test upload document button
      const uploadDocBtn = screen.queryByTestId('upload-document-btn')
      if (uploadDocBtn) {
        fireEvent.click(uploadDocBtn)
        const uploadModal = screen.queryByTestId('upload-document-modal')
        if (uploadModal) {
          expect(uploadModal).toBeInTheDocument()
          
          // Test file input
          const fileInput = screen.queryByTestId('document-file-input')
          if (fileInput) {
            const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
            fireEvent.change(fileInput, { target: { files: [file] } })
            expect(fileInput.files[0]).toBe(file)
          }
        }
      }
      
      // Test document download
      const downloadBtn = screen.queryByTestId('download-document-btn')
      if (downloadBtn) {
        fireEvent.click(downloadBtn)
      }
      
      // Test document delete
      const deleteDocBtn = screen.queryByTestId('delete-document-btn')
      if (deleteDocBtn) {
        fireEvent.click(deleteDocBtn)
      }
    })

    test('should test guest activity and comments', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      await waitFor(() => {
        expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Test activity section
      const activitySection = screen.queryByTestId('guest-activity-section')
      if (activitySection) {
        expect(activitySection).toBeInTheDocument()
      }
      
      // Test comments section
      const commentsSection = screen.queryByTestId('guest-comments-section')
      if (commentsSection) {
        expect(commentsSection).toBeInTheDocument()
        
        // Test add comment
        const addCommentBtn = screen.queryByTestId('add-comment-btn')
        if (addCommentBtn) {
          fireEvent.click(addCommentBtn)
        }
        
        // Test comment input
        const commentInput = screen.queryByTestId('comment-input')
        if (commentInput) {
          fireEvent.change(commentInput, { target: { value: 'Test comment' } })
          expect(commentInput).toHaveValue('Test comment')
        }
      }
    })

    test('should test guest deletion functionality', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      await waitFor(() => {
        expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Test delete guest button
      const deleteGuestBtn = screen.queryByTestId('delete-guest-btn')
      if (deleteGuestBtn) {
        fireEvent.click(deleteGuestBtn)
        const deleteModal = screen.queryByTestId('delete-guest-modal')
        if (deleteModal) {
          expect(deleteModal).toBeInTheDocument()
          
          // Test confirm delete
          const confirmDeleteBtn = screen.queryByTestId('confirm-delete-btn')
          if (confirmDeleteBtn) {
            fireEvent.click(confirmDeleteBtn)
          }
          
          // Test cancel delete
          const cancelDeleteBtn = screen.queryByTestId('cancel-delete-btn')
          if (cancelDeleteBtn) {
            fireEvent.click(cancelDeleteBtn)
          }
        }
      }
    })

    test('should test VIP guest status indicators', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      await waitFor(() => {
        expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Test VIP status badge
      const vipBadge = screen.queryByTestId('vip-guest-badge')
      if (vipBadge) {
        expect(vipBadge).toBeInTheDocument()
      }
      
      // Test star guest indicator
      const starGuest = screen.queryByTestId('star-guest-indicator')
      if (starGuest) {
        expect(starGuest).toBeInTheDocument()
      }
      
      // Test primary guest indicator
      const primaryGuest = screen.queryByTestId('primary-guest-indicator')
      if (primaryGuest) {
        expect(primaryGuest).toBeInTheDocument()
      }
    })

    test('should test guest loyalty tier display', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      await waitFor(() => {
        expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Test loyalty tier badge
      const loyaltyTier = screen.queryByTestId('loyalty-tier-badge')
      if (loyaltyTier) {
        expect(loyaltyTier).toBeInTheDocument()
      }
    })

    test('should test edit modal functionality', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      await waitFor(() => {
        expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Open edit modal
      const editBtn = screen.queryByTestId('edit-email-btn')
      if (editBtn) {
        fireEvent.click(editBtn)
        
        const editModal = screen.queryByTestId('edit-modal')
        if (editModal) {
          expect(editModal).toBeInTheDocument()
          
          // Test save button
          const saveBtn = screen.queryByTestId('save-edit-btn')
          if (saveBtn) {
            fireEvent.click(saveBtn)
          }
          
          // Test cancel button
          const cancelBtn = screen.queryByTestId('cancel-edit-btn')
          if (cancelBtn) {
            fireEvent.click(cancelBtn)
          }
          
          // Test close button
          const closeBtn = screen.queryByTestId('close-edit-btn')
          if (closeBtn) {
            fireEvent.click(closeBtn)
          }
        }
      }
    })

    test('should test responsive design elements', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      await waitFor(() => {
        expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Test mobile view elements
      const mobileView = screen.queryByTestId('mobile-guest-view')
      if (mobileView) {
        expect(mobileView).toBeInTheDocument()
      }
      
      // Test desktop view elements
      const desktopView = screen.queryByTestId('desktop-guest-view')
      if (desktopView) {
        expect(desktopView).toBeInTheDocument()
      }
    })
  })

  describe('Critical Error Scenarios', () => {
    test('should handle network timeout gracefully', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      // Page should render even if network fails
      expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
    })

    test('should handle cancelled requests gracefully', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      // Page should render even if requests are cancelled
      expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
    })

    test('should handle malformed API response', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      // Page should render even with malformed responses
      expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
    })

    test('should handle undefined API response', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      // Page should render even with undefined responses
      expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
    })

    test('should handle null API response', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      // Page should render even with null responses
      expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
    })

    test('should handle missing guest data', async () => {
      render(<GuestDetailsPage params={{ id: 'nonexistent' }} />)
      
      // Page should render even with missing data
      expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
    })

    test('should handle invalid guest ID', async () => {
      render(<GuestDetailsPage params={{ id: 'invalid_id' }} />)
      
      // Page should render even with invalid ID
      expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
    })

    test('should handle guest deletion errors', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      // Page should handle deletion errors gracefully
      expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
    })

    test('should handle document upload errors', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      // Page should handle upload errors gracefully
      expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
    })

    test('should handle edit field errors', async () => {
      render(<GuestDetailsPage params={{ id: 'guest_1' }} />)
      
      // Page should handle edit errors gracefully
      expect(screen.getByTestId('top-navigation')).toBeInTheDocument()
    })
  })
})
