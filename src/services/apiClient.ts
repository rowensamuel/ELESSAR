import { API_CONFIG } from '../config/api';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = 'API_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Standardized API Client that proxies all network communications.
 * Automatically unwraps standard success envelopes ({ success: true, data: T })
 * and extracts typed error information from { success: false, error: { code, message } }.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const base = API_CONFIG.BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  const url = endpoint.startsWith('http') ? endpoint : `${base}/${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...options.headers,
      },
      // Pass caller signal if provided; do NOT artificially cancel/abort long-running requests
      signal: options.signal,
    });

    let json: any = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        json = await response.json();
      } catch {
        json = null;
      }
    }

    if (!response.ok) {
      const code = json?.error?.code || `HTTP_${response.status}`;
      const message =
        json?.error?.message ||
        json?.message ||
        `HTTP Error ${response.status}: ${response.statusText}`;
      throw new ApiError(response.status, message, code, json);
    }

    if (json && json.success === false) {
      const code = json.error?.code || 'OPERATION_FAILED';
      const message = json.error?.message || 'Server indicated unsuccessful response';
      throw new ApiError(response.status || 500, message, code, json);
    }

    // Unwrap standard envelope if present, else return entire payload
    if (json !== null && json !== undefined) {
      if (json.data !== undefined) {
        return json.data as T;
      }
      return json as T;
    }

    return null as unknown as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err.name === 'AbortError') {
      throw new ApiError(
        499,
        'Client closed request.',
        'CANCELLED'
      );
    }
    // Failed to fetch / connection refused
    throw new ApiError(
      0,
      err.message || 'Unable to connect to backend server. Ensure API is running on port 5000.',
      'NETWORK_ERROR',
      err
    );
  }
}

// Backward compatibility alias
export const fetchWithTimeout = apiRequest;
