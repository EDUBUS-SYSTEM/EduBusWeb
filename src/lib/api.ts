import axios from "axios";

// Configure base URL for API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Alternative API URLs to try if the default fails
const FALLBACK_API_URLS = [
  "http://localhost:5000/api",
  "http://localhost:5223/api", 
  "http://localhost:7061/api",
  "https://localhost:7061/api"
];

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token to header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    if (error.response?.status === 401 && !url.includes("/auth/login")) {
      // Handle when token expires
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Function to test API connection and get working URL
export const testApiConnection = async (): Promise<string> => {
  for (const baseUrl of FALLBACK_API_URLS) {
    try {
      const testClient = axios.create({
        baseURL: baseUrl,
        timeout: 3000,
      });
      
      // Try to hit a simple endpoint
      await testClient.get('/health/live');
      console.log(`✅ API connection successful: ${baseUrl}`);
      return baseUrl;
    } catch {
      console.log(`❌ API connection failed: ${baseUrl}`);
      continue;
    }
  }
  
  console.warn('⚠️ No working API URL found, using default');
  return API_BASE_URL;
};

// Helper functions for API calls
export const apiService = {
  // GET request
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
    const response = await apiClient.get(url, { params });
    return response.data;
  },

  // POST request
  post: async <T>(url: string, data?: unknown): Promise<T> => {
    const response = await apiClient.post(url, data);
    return response.data;
  },

  // PUT request
  put: async <T>(url: string, data?: unknown): Promise<T> => {
    const response = await apiClient.put(url, data);
    return response.data;
  },

  // DELETE request
  delete: async <T>(url: string): Promise<T> => {
    const response = await apiClient.delete(url);
    return response.data;
  },

  // PATCH request
  patch: async <T>(url: string, data?: unknown): Promise<T> => {
    const response = await apiClient.patch(url, data);
    return response.data;
  },
};
