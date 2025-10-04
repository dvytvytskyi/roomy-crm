import { API_V2_CONFIG, ApiResponse, getApiUrl, API_V2_ENDPOINTS } from './config-v2';

// Token management for V2
class TokenManagerV2 {
  private static instance: TokenManagerV2;
  private accessToken: string | null = null;

  static getInstance(): TokenManagerV2 {
    if (!TokenManagerV2.instance) {
      TokenManagerV2.instance = new TokenManagerV2();
    }
    return TokenManagerV2.instance;
  }

  setToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
    
    // Also set cookie for middleware compatibility
    if (typeof document !== 'undefined') {
      document.cookie = `accessToken=${token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
    }
  }

  getToken(): string | null {
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

  clearToken() {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    
    // Clear cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// API Client V2
class ApiClientV2 {
  private baseURL: string;
  private timeout: number;
  private tokenManager: TokenManagerV2;

  constructor() {
    this.baseURL = API_V2_CONFIG.BASE_URL;
    this.timeout = API_V2_CONFIG.TIMEOUT;
    this.tokenManager = TokenManagerV2.getInstance();
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    console.log('🌐 API V2 Request:', { baseURL: this.baseURL, endpoint, finalURL: url });
    
    const token = this.tokenManager.getToken();

    const defaultHeaders = {
      ...API_V2_CONFIG.HEADERS,
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
        console.log('⏰ API V2 request timeout after', this.timeout, 'ms');
        controller.abort();
      }, this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          // Clear token and redirect to login
          this.tokenManager.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Authentication failed');
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
      console.error('API V2 request failed:', error);
      
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

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    console.log('📡 GET V2 Request:', { baseURL: this.baseURL, endpoint, params });
    
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
    const response = await this.post(API_V2_ENDPOINTS.AUTH.LOGIN, { email, password });
    if (response.success && response.data) {
      // V2 API returns 'token' in the response
      const token = response.data.token;
      if (token) {
        this.tokenManager.setToken(token);
      }
    }
    return response;
  }

  async getProfile(): Promise<ApiResponse> {
    return this.get(API_V2_ENDPOINTS.AUTH.PROFILE);
  }

  async logout(): Promise<void> {
    try {
      await this.post(API_V2_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.tokenManager.clearToken();
    }
  }

  async refreshToken(): Promise<ApiResponse> {
    const token = this.tokenManager.getToken();
    if (!token) {
      throw new Error('No token to refresh');
    }
    
    const response = await this.post(API_V2_ENDPOINTS.AUTH.REFRESH, { token });
    if (response.success && response.data) {
      const newToken = response.data.token;
      if (newToken) {
        this.tokenManager.setToken(newToken);
      }
    }
    return response;
  }

  isAuthenticated(): boolean {
    return this.tokenManager.isAuthenticated();
  }
}

// Export singleton instance
export const apiClientV2 = new ApiClientV2();
export const tokenManagerV2 = TokenManagerV2.getInstance();
