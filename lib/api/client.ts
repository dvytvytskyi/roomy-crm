import { API_CONFIG, ApiResponse } from './config';

// Token management
class TokenManager {
  private static instance: TokenManager;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string | null {
    if (!this.accessToken) {
      // Check localStorage first
      this.accessToken = localStorage.getItem('accessToken');
      
      // If not in localStorage, check cookies (for middleware compatibility)
      if (!this.accessToken && typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
        if (tokenCookie) {
          this.accessToken = tokenCookie.split('=')[1];
          // Store in localStorage for consistency
          localStorage.setItem('accessToken', this.accessToken);
        }
      }
    }
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    if (!this.refreshToken) {
      this.refreshToken = localStorage.getItem('refreshToken');
    }
    return this.refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// API Client
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private tokenManager: TokenManager;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.tokenManager = TokenManager.getInstance();
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    // console.log('🌐 API Request:', { baseURL: this.baseURL, endpoint, finalURL: url }); // Disabled to reduce console spam
    const token = this.tokenManager.getAccessToken();

    const defaultHeaders = {
      ...API_CONFIG.HEADERS,
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ API request timeout after', this.timeout, 'ms');
        controller.abort();
      }, this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry the original request
            return this.makeRequest<T>(endpoint, options);
          } else {
            // Redirect to login
            this.tokenManager.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            throw new Error('Authentication failed');
          }
        }
        
        // Try to parse error response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch (e) {
          // If can't parse JSON, use default message
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('Request was aborted (timeout or manual abort)');
          throw new Error('Request timeout - server is taking too long to respond');
        } else if (error.message.includes('Failed to fetch')) {
          console.error('Network error - server might be unreachable');
          throw new Error('Network error - cannot connect to server');
        } else if (error.message.includes('signal is aborted')) {
          console.error('Signal aborted error');
          throw new Error('Request was cancelled - please try again');
        }
      }
      
      throw error;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = this.tokenManager.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.tokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    // console.log('📡 GET Request:', { baseURL: this.baseURL, endpoint, params }); // Disabled to reduce console spam
    
    // Build query string if params exist
    let queryString = '';
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      queryString = searchParams.toString();
    }
    
    // Use endpoint directly, not URL.pathname which includes /api
    const finalEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.makeRequest<T>(finalEndpoint);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Auth methods
  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await this.post('/api/auth/login', { email, password });
    if (response.success && response.data) {
      // Our backend returns 'token' instead of 'accessToken'
      const token = response.data.token || response.data.accessToken;
      const refreshToken = response.data.refreshToken || '';
      this.tokenManager.setTokens(token, refreshToken);
    }
    return response;
  }

  async register(userData: any): Promise<ApiResponse> {
    const response = await this.post('/api/auth/register', userData);
    if (response.success && response.data) {
      // Our backend returns 'token' instead of 'accessToken'
      const token = response.data.token || response.data.accessToken;
      const refreshToken = response.data.refreshToken || '';
      this.tokenManager.setTokens(token, refreshToken);
    }
    return response;
  }

  async logout(): Promise<void> {
    this.tokenManager.clearTokens();
  }

  isAuthenticated(): boolean {
    return this.tokenManager.isAuthenticated();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export const tokenManager = TokenManager.getInstance();
