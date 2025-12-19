import axios, { AxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const FALLBACK_API_URLS = [
  "http://localhost:5000/api",
  "http://localhost:5223/api", 
  "http://localhost:7061/api",
  "https://localhost:7061/api"
];

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, 
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED' || error.name === 'AbortError' || error.message === 'canceled') {
      return Promise.reject(error);
    }

    const url = error.config?.url || "";
    if (error.response?.status === 401 && !url.includes("/auth/login") && !url.includes("localhost:5000")) {
      localStorage.removeItem("token");
      globalThis.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const testApiConnection = async (): Promise<string> => {
  for (const baseUrl of FALLBACK_API_URLS) {
    try {
      const testClient = axios.create({
        baseURL: baseUrl,
        timeout: 3000,
      });
      
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

export const apiService = {
  get: async <T>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.get(url, {
      params,
      ...config,
    });
    return response.data;
  },

  post: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.post(url, data, config);
    return response.data;
  },

  put: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.put(url, data, config);
    return response.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete(url, config);
    return response.data;
  },

  patch: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.patch(url, data, config);
    return response.data;
  },
};
