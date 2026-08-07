import type { ApiResponse } from '../utils/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export function getStoreId(): string {
  try {
    if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function') {
      return localStorage.getItem('kirstry_store_id') || '';
    }
  } catch (e) {
    // Ignore storage errors
  }
  return '';
}

export function setStoreId(storeId: string): void {
  try {
    if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.setItem === 'function') {
      localStorage.setItem('kirstry_store_id', storeId);
    }
  } catch (e) {
    // Ignore storage errors
  }
}

export function getAuthToken(): string | null {
  try {
    if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function') {
      return localStorage.getItem('kirstry_auth_token');
    }
  } catch (e) {
    // Ignore storage errors
  }
  return null;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  silentErrors?: boolean;
}

export async function request<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, headers: customHeaders, silentErrors = false, ...customOptions } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Store-ID': getStoreId(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(customHeaders as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      headers,
      ...customOptions,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || `Request failed with status ${response.status}`);
      (err as any).status = response.status;
      throw err;
    }

    return data;
  } catch (error: any) {
    // Suppress console error output for silent requests (e.g. auth check)
    if (!silentErrors && endpoint !== '/auth/me') {
      console.warn(`API Request [${endpoint}]:`, error?.message || error);
    }
    throw error;
  }
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
