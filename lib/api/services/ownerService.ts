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
      throw error;
    }
  }

  async getOwner(id: string): Promise<ApiResponse<Owner>> {
    const url = buildApiUrl(`${this.baseUrl}/${id}`);
    return fetch(url, { headers: getDefaultHeaders() }).then(res => res.json());
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
    const url = buildApiUrl(`${this.baseUrl}/stats`);
    return fetch(url, { headers: getDefaultHeaders() }).then(res => res.json());
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
    const url = buildApiUrl(`${this.baseUrl}/${ownerId}/activity-log`);
    return fetch(url, { headers: getDefaultHeaders() }).then(res => res.json());
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
