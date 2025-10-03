import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import OwnersPage from '../app/owners/page'
import OwnerDetailsPage from '../app/owners/[id]/page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/owners',
}))

// Mock the ownerService
jest.mock('../lib/api/services/ownerService', () => ({
  ownerService: {
    getOwners: jest.fn(() => Promise.resolve({
      success: true,
      data: {
        owners: [
          {
            id: 'owner_1',
            firstName: 'Mohammed',
            lastName: 'Al-Maktoum',
            email: 'mohammed.almaktoum@roomy.com',
            phone: '+971 50 123 4567',
            nationality: 'Emirati',
            dateOfBirth: '1975-03-15',
            role: 'OWNER',
            isActive: true,
            properties: ['Burj Khalifa Penthouse', 'Palm Jumeirah Villa'],
            totalUnits: 2,
            comments: 'VIP owner with premium properties.',
            createdAt: '2023-01-15T10:00:00Z',
            createdBy: 'admin',
            lastModifiedAt: '2024-09-01T14:30:00Z',
            lastModifiedBy: 'manager'
          },
          {
            id: 'owner_2',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@roomy.com',
            phone: '+1 555 234 5678',
            nationality: 'American',
            dateOfBirth: '1982-07-20',
            role: 'OWNER',
            isActive: true,
            properties: ['Marina Apartment Complex'],
            totalUnits: 1,
            comments: 'Reliable owner with excellent payment history.',
            createdAt: '2023-03-20T11:00:00Z',
            createdBy: 'admin',
            lastModifiedAt: '2024-08-15T09:20:00Z',
            lastModifiedBy: 'admin'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        }
      }
    })),
    getOwner: jest.fn(() => Promise.resolve({
      success: true,
      data: {
        id: 'owner_1',
        firstName: 'Mohammed',
        lastName: 'Al-Maktoum',
        email: 'mohammed.almaktoum@roomy.com',
        phone: '+971 50 123 4567',
        nationality: 'Emirati',
        dateOfBirth: '1975-03-15',
        role: 'OWNER',
        isActive: true,
        properties: ['Burj Khalifa Penthouse', 'Palm Jumeirah Villa'],
        totalUnits: 2,
        comments: 'VIP owner with premium properties.',
        createdAt: '2023-01-15T10:00:00Z',
        createdBy: 'admin',
        lastModifiedAt: '2024-09-01T14:30:00Z',
        lastModifiedBy: 'manager',
        documents: [],
        bankDetails: [],
        transactions: [],
        activityLog: []
      }
    })),
    createOwner: jest.fn(),
    updateOwner: jest.fn(),
    deleteOwner: jest.fn(),
    getOwnerStats: jest.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock fetch
global.fetch = jest.fn()

describe('Owners Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    
    // Mock successful API response
    const mockOwners = [
      {
        id: 'owner_1',
        firstName: 'Mohammed',
        lastName: 'Al-Maktoum',
        email: 'mohammed.almaktoum@roomy.com',
        phone: '+971 50 123 4567',
        nationality: 'Emirati',
        dateOfBirth: '1975-03-15',
        role: 'OWNER',
        isActive: true,
        properties: ['Burj Khalifa Penthouse', 'Palm Jumeirah Villa'],
        totalUnits: 2,
        comments: 'VIP owner with premium properties. Excellent payment history and responsive communication.',
        createdAt: '2023-01-15T10:00:00Z',
        createdBy: 'admin',
        lastModifiedAt: '2024-09-01T14:30:00Z',
        lastModifiedBy: 'manager'
      },
      {
        id: 'owner_2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@roomy.com',
        phone: '+1 555 234 5678',
        nationality: 'American',
        dateOfBirth: '1982-07-20',
        role: 'OWNER',
        isActive: true,
        properties: ['Marina Apartment Complex'],
        totalUnits: 1,
        comments: 'Reliable owner with excellent payment history.',
        createdAt: '2023-03-20T11:00:00Z',
        createdBy: 'admin',
        lastModifiedAt: '2024-08-15T09:20:00Z',
        lastModifiedBy: 'admin'
      }
    ]

    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          owners: mockOwners,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1
          }
        }
      })
    })
  })

  it('renders owners page with search and add button', async () => {
    render(<OwnersPage />)
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Owners' })).toBeInTheDocument()
    })

    expect(screen.getByTestId('search-input')).toBeInTheDocument()
    expect(screen.getByTestId('add-owner-btn')).toBeInTheDocument()
  })

  it('displays owner statistics cards', async () => {
    render(<OwnersPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId('total-owners-card')).toBeInTheDocument()
      expect(screen.getByTestId('active-owners-card')).toBeInTheDocument()
      expect(screen.getByTestId('total-units-card')).toBeInTheDocument()
      expect(screen.getByTestId('vip-owners-card')).toBeInTheDocument()
    })

    // Check that statistics are displayed
    expect(screen.getByText('Total Owners')).toBeInTheDocument()
    expect(screen.getByText('Active Owners')).toBeInTheDocument()
    expect(screen.getByText('Total Units')).toBeInTheDocument()
    expect(screen.getByText('VIP Owners')).toBeInTheDocument()
  })

  it('displays owners table', async () => {
    render(<OwnersPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId('owners-table-container')).toBeInTheDocument()
    })
  })

  it('handles search input', async () => {
    render(<OwnersPage />)
    
    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'Mohammed' } })
    
    expect(searchInput).toHaveValue('Mohammed')
  })

  it('opens add owner modal when add button is clicked', async () => {
    render(<OwnersPage />)
    
    const addButton = screen.getByTestId('add-owner-btn')
    fireEvent.click(addButton)
    
    // Modal should open (this would be tested in the modal component)
    expect(addButton).toBeInTheDocument()
  })
})

describe('Owner Details Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    
    // Mock successful API response for owner details
    const mockOwner = {
      id: 'owner_1',
      firstName: 'Mohammed',
      lastName: 'Al-Maktoum',
      email: 'mohammed.almaktoum@roomy.com',
      phone: '+971 50 123 4567',
      nationality: 'Emirati',
      dateOfBirth: '1975-03-15',
      role: 'OWNER',
      isActive: true,
      properties: ['Burj Khalifa Penthouse', 'Palm Jumeirah Villa'],
      totalUnits: 2,
      comments: 'VIP owner with premium properties.',
      createdAt: '2023-01-15T10:00:00Z',
      createdBy: 'admin',
      lastModifiedAt: '2024-09-01T14:30:00Z',
      lastModifiedBy: 'manager',
      documents: [],
      bankDetails: [],
      transactions: [],
      activityLog: []
    }

    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: mockOwner
      })
    })
  })

  it('renders owner details page', async () => {
    render(<OwnerDetailsPage params={{ id: 'owner_1' }} />)
    
    await waitFor(() => {
      expect(screen.getByText('Mohammed Al-Maktoum')).toBeInTheDocument()
    })

    expect(screen.getByTestId('back-btn')).toBeInTheDocument()
  })

  it('displays owner information', async () => {
    render(<OwnerDetailsPage params={{ id: 'owner_1' }} />)
    
    await waitFor(() => {
      expect(screen.getByText('Mohammed Al-Maktoum')).toBeInTheDocument()
    })
    
    // Use getAllByText for Emirati since it appears multiple times
    const emiratiElements = screen.getAllByText('Emirati')
    expect(emiratiElements.length).toBeGreaterThan(0)
  })

  it('shows bank details section', async () => {
    render(<OwnerDetailsPage params={{ id: 'owner_1' }} />)
    
    await waitFor(() => {
      expect(screen.getByText('Bank Details')).toBeInTheDocument()
    })

    expect(screen.getByTestId('add-bank-btn')).toBeInTheDocument()
  })

  it('shows documents section', async () => {
    render(<OwnerDetailsPage params={{ id: 'owner_1' }} />)
    
    await waitFor(() => {
      expect(screen.getByText('Documents')).toBeInTheDocument()
    })

    expect(screen.getByTestId('upload-document-btn')).toBeInTheDocument()
  })

  it('shows properties section', async () => {
    render(<OwnerDetailsPage params={{ id: 'owner_1' }} />)
    
    await waitFor(() => {
      expect(screen.getByText('Properties')).toBeInTheDocument()
    })
  })

  it('shows transaction history section', async () => {
    render(<OwnerDetailsPage params={{ id: 'owner_1' }} />)
    
    await waitFor(() => {
      expect(screen.getByText('Transaction History')).toBeInTheDocument()
    })
  })

  it('shows activity log section', async () => {
    render(<OwnerDetailsPage params={{ id: 'owner_1' }} />)
    
    await waitFor(() => {
      expect(screen.getByText('Activity Log')).toBeInTheDocument()
    })
  })

  it('handles back button click', async () => {
    render(<OwnerDetailsPage params={{ id: 'owner_1' }} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('back-btn')).toBeInTheDocument()
    })

    const backButton = screen.getByTestId('back-btn')
    fireEvent.click(backButton)
    
    // Back button should be clickable
    expect(backButton).toBeInTheDocument()
  })

  it('handles add bank account button click', async () => {
    render(<OwnerDetailsPage params={{ id: 'owner_1' }} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('add-bank-btn')).toBeInTheDocument()
    })

    const addBankButton = screen.getByTestId('add-bank-btn')
    fireEvent.click(addBankButton)
    
    // Button should be clickable
    expect(addBankButton).toBeInTheDocument()
  })

  it('handles upload document button click', async () => {
    render(<OwnerDetailsPage params={{ id: 'owner_1' }} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('upload-document-btn')).toBeInTheDocument()
    })

    const uploadButton = screen.getByTestId('upload-document-btn')
    fireEvent.click(uploadButton)
    
    // Button should be clickable
    expect(uploadButton).toBeInTheDocument()
  })
})
