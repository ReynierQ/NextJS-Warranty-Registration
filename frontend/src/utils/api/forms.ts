import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.255.100.199:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Accept': 'application/json',
  }
});

export interface WarrantyRegistrationData {
  name: string;
  email: string;
  contactNumber: string;
  gender: string;
  birthdate: string;
  brand: string;
  productName: string;
  purchaseFrom: string;
  purchaseType: string; // Store or Online
  storeName: string; // Which store
  storeBranch: string; // Which branch
  onlinePlatform: string; // Lazada, TikTok, Shopee, jblstore.com.ph
  onlineStore: string; // JBL Lazada, Onward Lazada, etc.
  purchaseDate: string;
  receiptNumber: string;
  serialNumber: string;
  receiptImage: File;
  termsAccepted: boolean;
  pdpaAccepted: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  registrationId?: string;
}

export const warrantyApi = {
  // Submit warranty registration
  async submitRegistration(data: WarrantyRegistrationData): Promise<ApiResponse> {
    try {
      const normalizeDate = (date: any) => {
        if (!date) return '';
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date; // already clean
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };

      data.birthdate = normalizeDate(data.birthdate);
      data.purchaseDate = normalizeDate(data.purchaseDate);

      const formData = new FormData();
      
      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'receiptImage' && value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      const response = await apiClient.post<ApiResponse>('/warranty/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiResponse>;
        
        // Log detailed error information
        console.error('API Error Details:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          message: axiosError.message
        });

        // Return error response if available
        if (axiosError.response?.data) {
          throw new Error(
            axiosError.response.data.message || 
            (axiosError.response.data.errors ? axiosError.response.data.errors.join(', ') : 'Registration failed')
          );
        }
        
        throw new Error(axiosError.message || 'Network error occurred');
      }
      
      console.error('Unexpected error:', error);
      throw error;
    }
  },

  // Get registration by ID
  async getRegistration(id: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.get<ApiResponse>(`/warranty/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiResponse>;
        console.error('API Error:', axiosError.response?.data);
        throw new Error(axiosError.response?.data?.message || 'Failed to fetch registration');
      }
      throw error;
    }
  },

  // Check server health
  async healthCheck(): Promise<ApiResponse> {
    try {
      const response = await apiClient.get<ApiResponse>('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
};

export const adminWarrantyApi = {
  // List warranties + optional search
  async list(search = ''): Promise<ApiResponse> {
    const response = await apiClient.get<ApiResponse>(
      `/warranty/warranties?search=${encodeURIComponent(search)}`
    );
    return response.data;
  },

  // Get single warranty
  async getById(id: string): Promise<ApiResponse> {
    const response = await apiClient.get<ApiResponse>(`/warranty/warranties/${id}`);
    return response.data;
  },

  // Update warranty (e.g., status)
  async update(id: string, payload: Partial<{ status: string }>): Promise<ApiResponse> {
    const response = await apiClient.put<ApiResponse>(
      `/warranty/warranties/${id}`,
      payload
    );
    return response.data;
  },

  // Delete warranty
  async remove(id: string): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `/warranty/warranties/${id}`
    );
    return response.data;
  }
};

export const formConfigApi = {
  async fetchConfig() {
    try {
      const response = await apiClient.get("/form/public-config");
      const data = response.data.data || response.data;

      return {
        storeOptions:
          typeof data.store_options === "string"
            ? JSON.parse(data.store_options)
            : data.store_options,

        onlinePlatformStores:
          typeof data.online_platform_stores === "string"
            ? JSON.parse(data.online_platform_stores)
            : data.online_platform_stores,

        brandOptions:
          typeof data.brand_options === "string"
            ? JSON.parse(data.brand_options)
            : data.brand_options,

        purchaseTypeOptions:
          typeof data.purchase_type_options === "string"
            ? JSON.parse(data.purchase_type_options)
            : data.purchase_type_options,
      };
    } catch (err) {
      console.error("Failed to load form config:", err);
      throw err;
    }
  },
};

export const adminApi = {
  // List all admins
  async list(): Promise<ApiResponse> {
    const response = await apiClient.get<ApiResponse>('/admin/list');
    return response.data;
  },

  // Register admin
  async register(data: { name: string; email: string; password: string }): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/admin/register', data);
    return response.data;
  },

  // Delete admin
  async remove(id: string): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(`/admin/${id}`);
    return response.data;
  }
};

export default apiClient;