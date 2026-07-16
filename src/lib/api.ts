import { toast } from '@/components/Toast';

const API_BASE_URL = 'http://localhost:3001';
const REQUEST_TIMEOUT = 10000;

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: {
    id: string;
    email: string;
    createdAt: string;
  };
  remaining?: number;
  [key: string]: unknown;
}

export interface RequestConfig extends RequestInit {
  timeout?: number;
  showErrorToast?: boolean;
  skipAuth?: boolean;
}

class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

function getAuthToken(): string | null {
  try {
    return localStorage.getItem('vaultkey-api-token');
  } catch {
    return null;
  }
}

async function request<T = unknown>(
  url: string,
  options: RequestConfig = {},
): Promise<ApiResponse<T>> {
  const {
    timeout = REQUEST_TIMEOUT,
    showErrorToast = true,
    skipAuth = false,
    headers,
    body,
    ...restOptions
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (!skipAuth) {
      const token = getAuthToken();
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const finalHeaders = {
      ...defaultHeaders,
      ...headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...restOptions,
      headers: finalHeaders,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || `请求失败 (${response.status})`;
      
      if (showErrorToast) {
        if (response.status === 401) {
          toast.error('登录已过期，请重新登录');
        } else if (response.status === 429) {
          toast.warning('操作过于频繁，请稍后重试');
        } else {
          toast.error(errorMessage);
        }
      }

      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    const err = error as Error;
    let message = '网络请求失败';

    if (err.name === 'AbortError') {
      message = '请求超时，请检查网络连接';
    } else if (err.message) {
      message = err.message;
    }

    if (showErrorToast) {
      toast.error(message);
    }

    throw new ApiError(message, 0);
  }
}

export const api = {
  get<T = unknown>(url: string, options?: RequestConfig) {
    return request<T>(url, { ...options, method: 'GET' });
  },

  post<T = unknown>(url: string, body?: unknown, options?: RequestConfig) {
    return request<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T = unknown>(url: string, body?: unknown, options?: RequestConfig) {
    return request<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T = unknown>(url: string, options?: RequestConfig) {
    return request<T>(url, { ...options, method: 'DELETE' });
  },

  patch<T = unknown>(url: string, body?: unknown, options?: RequestConfig) {
    return request<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
};

export default api;
