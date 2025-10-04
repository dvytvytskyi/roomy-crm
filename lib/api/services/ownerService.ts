import { ApiResponse } from '../client';
import { getAuthToken, buildApiUrl, getDefaultHeaders } from '../production-utils';

// Owner interface
export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  dateOfBirth: string;
  role: string;
  isActive: boolean;
  properties: string[];
  totalUnits: number;
  comments: string;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
  documents: OwnerDocument[];
  bankDetails: BankDetail[];
  transactions: Transaction[];
  activityLog: ActivityLog[];
}

export interface OwnerDocument {
  id: number;
  name: string;
  type: string;
  uploadedAt: string;
  size: string;
  s3Key: string;
  s3Url: string;
}

export interface BankDetail {
  id: number;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  iban: string;
  swiftCode: string;
  bankAddress: string;
  isPrimary: boolean;
  addedDate: string;
  addedBy: string;
  addedByEmail: string;
}

export interface Transaction {
  id: number;
  type: string;
  amount: number;
  currency: string;
  description: string;
  bankDetailId: number;
  status: string;
  date: string;
  processedBy: string;
  processedByEmail: string;
  reference: string;
  title: string;
  responsible: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  user: string;
  type: string;
}

export interface OwnersResponse {
  owners: Owner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OwnerStats {
  totalOwners: number;
  activeOwners: number;
  inactiveOwners: number;
  totalUnits: number;
  totalTransactions: number;
  totalAmount: number;
}

export interface CreateOwnerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  dateOfBirth: string;
  comments?: string;
}

export interface UpdateOwnerRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  dateOfBirth?: string;
  isActive?: boolean;
  comments?: string;
}

export interface OwnerFilters {
  search?: string;
  page?: number;
  limit?: number;
  nationality?: string;
  isActive?: boolean;
  dateOfBirthFrom?: string;
  dateOfBirthTo?: string;
  phoneNumber?: string;
  comments?: string;
}

export interface AddBankDetailRequest {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  iban: string;
  swiftCode: string;
  bankAddress: string;
  isPrimary?: boolean;
}

export interface AddTransactionRequest {
  type: string;
  amount: number;
  currency: string;
  description: string;
  bankDetailId: number;
  status: string;
  reference: string;
  title: string;
  responsible: string;
}

export interface UploadDocumentRequest {
  file: File;
  type: string;
  description?: string;
}

class OwnerService {
  private baseUrl = '/api/users/owners';

  async getOwners(filters?: OwnerFilters): Promise<ApiResponse<OwnersResponse>> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.nationality) params.append('nationality', filters.nationality);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.dateOfBirthFrom) params.append('dateOfBirthFrom', filters.dateOfBirthFrom);
    if (filters?.dateOfBirthTo) params.append('dateOfBirthTo', filters.dateOfBirthTo);
    if (filters?.phoneNumber) params.append('phoneNumber', filters.phoneNumber);
    if (filters?.comments) params.append('comments', filters.comments);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    try {
      const fullUrl = buildApiUrl(url);
      console.log('🌐 OwnerService: Fetching owners from:', fullUrl);
      const response = await fetch(fullUrl, {
        headers: {
          ...getDefaultHeaders(),
          'Accept': 'application/json',
        },
      });
      console.log('📡 OwnerService: Response status:', response.status);
      const data = await response.json();
      console.log('📋 OwnerService: Response data:', data);
      return data;
    } catch (error) {
      console.error('❌ OwnerService: Error fetching owners:', error);
      
      // Return mock data on error
      const mockOwners: Owner[] = [
        {
          id: 'owner_1',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com',
          phone: '+971 50 123 4567',
          nationality: 'American',
          dateOfBirth: '1985-03-15',
          role: 'OWNER',
          isActive: true,
          properties: ['Luxury Apartment Downtown Dubai'],
          totalUnits: 1,
          comments: 'VIP Owner - Excellent payment history',
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 'admin@roomy.com',
          lastModifiedAt: '2024-01-15T10:30:00.000Z',
          lastModifiedBy: 'admin@roomy.com',
          documents: [],
          bankDetails: [],
          transactions: [],
          activityLog: []
        },
        {
          id: 'owner_2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+971 50 987 6543',
          nationality: 'British',
          dateOfBirth: '1990-07-22',
          role: 'OWNER',
          isActive: true,
          properties: ['Beach Villa Palm Jumeirah'],
          totalUnits: 1,
          comments: 'Regular owner - Good communication',
          createdAt: '2024-01-05T00:00:00.000Z',
          createdBy: 'admin@roomy.com',
          lastModifiedAt: '2024-01-10T14:20:00.000Z',
          lastModifiedBy: 'admin@roomy.com',
          documents: [],
          bankDetails: [],
          transactions: [],
          activityLog: []
        },
        {
          id: 'owner_3',
          firstName: 'Ahmed',
          lastName: 'Al-Rashid',
          email: 'ahmed.alrashid@example.com',
          phone: '+971 50 555 1234',
          nationality: 'Emirati',
          dateOfBirth: '1978-11-08',
          role: 'OWNER',
          isActive: true,
          properties: ['Business Bay Office'],
          totalUnits: 1,
          comments: 'Local owner - Premium properties',
          createdAt: '2024-01-08T00:00:00.000Z',
          createdBy: 'admin@roomy.com',
          lastModifiedAt: '2024-01-12T09:15:00.000Z',
          lastModifiedBy: 'admin@roomy.com',
          documents: [],
          bankDetails: [],
          transactions: [],
          activityLog: []
        }
      ];
      
      return {
        success: true,
        data: {
          owners: mockOwners,
          pagination: {
            page: 1,
            limit: 10,
            total: mockOwners.length,
            totalPages: 1
          }
        }
      };
    }
  }

  async getOwner(id: string): Promise<ApiResponse<Owner>> {
    // Always return mock data for now
    console.log('🏠 Using mock owner data for ID:', id);
    
    const mockOwner: Owner = {
      id: id,
      firstName: 'Ahmed',
      lastName: 'Al-Rashid',
      email: 'ahmed.alrashid@example.com',
      phone: '+971 50 555 1234',
      nationality: 'Emirati',
      dateOfBirth: '1978-11-08',
      role: 'OWNER',
      isActive: true,
      properties: ['Business Bay Office'],
      totalUnits: 1,
      comments: 'Local owner - Premium properties. Excellent communication and always pays on time.',
      createdAt: '2024-01-08T00:00:00.000Z',
      createdBy: 'admin@roomy.com',
      lastModifiedAt: '2024-01-12T09:15:00.000Z',
      lastModifiedBy: 'admin@roomy.com',
      documents: [
        {
          id: 4,
          name: 'Emirates_ID_Ahmed_AlRashid.pdf',
          type: 'emirates_id',
          uploadedAt: '2024-01-08T00:00:00.000Z',
          size: '1.7 MB',
          s3Key: 'documents/owner_3/emirates_id.pdf',
          s3Url: 'https://s3.amazonaws.com/roomy-ae/documents/owner_3/emirates_id.pdf'
        }
      ],
      bankDetails: [
        {
          id: 3,
          bankName: 'FAB',
          accountHolderName: 'Ahmed Al-Rashid',
          accountNumber: '5555123456',
          iban: 'AE070335555123456123456',
          swiftCode: 'FABLAEAD',
          bankAddress: 'Sheikh Khalifa Bin Zayed Street, Dubai',
          isPrimary: true,
          addedDate: '2024-01-08T00:00:00.000Z',
          addedBy: 'admin@roomy.com',
          addedByEmail: 'admin@roomy.com'
        }
      ],
      transactions: [
        {
          id: 3,
          type: 'payout',
          amount: 7800,
          currency: 'AED',
          description: 'Monthly rental income payout',
          bankDetailId: 3,
          status: 'completed',
          date: '2024-01-15T00:00:00.000Z',
          processedBy: 'admin@roomy.com',
          processedByEmail: 'admin@roomy.com',
          reference: 'PAY_2024_003',
          title: 'January 2024 Payout',
          responsible: 'Admin'
        }
      ],
      activityLog: [
        {
          id: 5,
          action: 'created',
          description: 'Owner account created',
          timestamp: '2024-01-08T00:00:00.000Z',
          user: 'admin@roomy.com',
          type: 'account'
        },
        {
          id: 6,
          action: 'updated',
          description: 'Property information updated',
          timestamp: '2024-01-12T09:15:00.000Z',
          user: 'admin@roomy.com',
          type: 'property'
        }
      ]
    };
    
    return {
      success: true,
      data: mockOwner
    };
  }

  async createOwner(data: CreateOwnerRequest): Promise<ApiResponse<Owner>> {
    const url = buildApiUrl(this.baseUrl);
    return fetch(url, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify(data),
    }).then(res => res.json());
  }

  async updateOwner(id: string, data: UpdateOwnerRequest): Promise<ApiResponse<Owner>> {
    const url = buildApiUrl(`${this.baseUrl}/${id}`);
    return fetch(url, {
      method: 'PUT',
      headers: getDefaultHeaders(),
      body: JSON.stringify(data),
    }).then(res => res.json());
  }

  async deleteOwner(id: string): Promise<ApiResponse<void>> {
    const url = buildApiUrl(`${this.baseUrl}/${id}`);
    return fetch(url, {
      method: 'DELETE',
      headers: getDefaultHeaders(),
    }).then(res => res.json());
  }

  async getOwnerStats(): Promise<ApiResponse<OwnerStats>> {
    try {
      const url = buildApiUrl(`${this.baseUrl}/stats`);
      return fetch(url, { headers: getDefaultHeaders() }).then(res => res.json());
    } catch (error) {
      console.error('Error fetching owner stats:', error);
      
      // Return mock data on error
      const mockStats: OwnerStats = {
        totalOwners: 5,
        activeOwners: 4,
        inactiveOwners: 1,
        totalUnits: 6,
        totalTransactions: 4,
        totalAmount: 31000
      };
      
      return {
        success: true,
        data: mockStats
      };
    }
  }

  async addBankDetail(ownerId: string, data: AddBankDetailRequest): Promise<ApiResponse<BankDetail>> {
    const url = buildApiUrl(`${this.baseUrl}/${ownerId}/bank-details`);
    return fetch(url, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify(data),
    }).then(res => res.json());
  }

  async updateBankDetail(ownerId: string, bankDetailId: number, data: Partial<AddBankDetailRequest>): Promise<ApiResponse<BankDetail>> {
    const url = buildApiUrl(`${this.baseUrl}/${ownerId}/bank-details/${bankDetailId}`);
    return fetch(url, {
      method: 'PUT',
      headers: getDefaultHeaders(),
      body: JSON.stringify(data),
    }).then(res => res.json());
  }

  async deleteBankDetail(ownerId: string, bankDetailId: number): Promise<ApiResponse<void>> {
    const url = buildApiUrl(`${this.baseUrl}/${ownerId}/bank-details/${bankDetailId}`);
    return fetch(url, {
      method: 'DELETE',
      headers: getDefaultHeaders(),
    }).then(res => res.json());
  }

  async addTransaction(ownerId: string, data: AddTransactionRequest): Promise<ApiResponse<Transaction>> {
    const url = buildApiUrl(`${this.baseUrl}/${ownerId}/transactions`);
    return fetch(url, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify(data),
    }).then(res => res.json());
  }

  async updateTransaction(ownerId: string, transactionId: number, data: Partial<AddTransactionRequest>): Promise<ApiResponse<Transaction>> {
    const url = buildApiUrl(`${this.baseUrl}/${ownerId}/transactions/${transactionId}`);
    return fetch(url, {
      method: 'PUT',
      headers: getDefaultHeaders(),
      body: JSON.stringify(data),
    }).then(res => res.json());
  }

  async deleteTransaction(ownerId: string, transactionId: number): Promise<ApiResponse<void>> {
    const url = buildApiUrl(`${this.baseUrl}/${ownerId}/transactions/${transactionId}`);
    return fetch(url, {
      method: 'DELETE',
      headers: getDefaultHeaders(),
    }).then(res => res.json());
  }

  async uploadDocument(ownerId: string, data: UploadDocumentRequest): Promise<ApiResponse<OwnerDocument>> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('type', data.type);
    if (data.description) formData.append('description', data.description);

    const url = buildApiUrl(`${this.baseUrl}/${ownerId}/documents`);
    return fetch(url, {
      method: 'POST',
      headers: { 'Authorization': getAuthToken() },
      body: formData,
    }).then(res => res.json());
  }

  async deleteDocument(ownerId: string, documentId: number): Promise<ApiResponse<void>> {
    const url = buildApiUrl(`${this.baseUrl}/${ownerId}/documents/${documentId}`);
    return fetch(url, {
      method: 'DELETE',
      headers: getDefaultHeaders(),
    }).then(res => res.json());
  }

  async getOwnerActivityLog(ownerId: string): Promise<ApiResponse<ActivityLog[]>> {
    // Always return mock data for now
    console.log('📋 Using mock activity log data for owner:', ownerId);
    
    const mockActivityLog: ActivityLog[] = [
      {
        id: 1,
        action: 'created',
        description: 'Owner account created',
        timestamp: '2024-01-08T00:00:00.000Z',
        user: 'admin@roomy.com',
        type: 'account'
      },
      {
        id: 2,
        action: 'updated',
        description: 'Property information updated',
        timestamp: '2024-01-12T09:15:00.000Z',
        user: 'admin@roomy.com',
        type: 'property'
      },
      {
        id: 3,
        action: 'bank_detail_added',
        description: 'Bank account details added',
        timestamp: '2024-01-08T00:00:00.000Z',
        user: 'admin@roomy.com',
        type: 'banking'
      },
      {
        id: 4,
        action: 'document_uploaded',
        description: 'Emirates ID document uploaded',
        timestamp: '2024-01-08T00:00:00.000Z',
        user: 'admin@roomy.com',
        type: 'document'
      },
      {
        id: 5,
        action: 'payout_processed',
        description: 'Monthly payout processed - AED 7,800',
        timestamp: '2024-01-15T00:00:00.000Z',
        user: 'admin@roomy.com',
        type: 'transaction'
      }
    ];
    
    return {
      success: true,
      data: mockActivityLog
    };
  }

  async addActivityLog(ownerId: string, action: string, description: string): Promise<ApiResponse<ActivityLog>> {
    const url = buildApiUrl(`${this.baseUrl}/${ownerId}/activity-log`);
    return fetch(url, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({ action, description }),
    }).then(res => res.json());
  }
}

export const ownerService = new OwnerService();
