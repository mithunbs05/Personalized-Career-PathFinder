const FASTAPI_BASE = import.meta.env.DEV ? 'http://localhost:8000/api/v1' : '/api/v1';
const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = localStorage.getItem('pathai_access_token');
  if (!token) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        try {
          const parsed = JSON.parse(localStorage.getItem(key) || '{}');
          if (parsed.access_token) {
            token = parsed.access_token;
            break;
          }
        } catch {}
      }
    }
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let url: string;
  if (endpoint.startsWith('http')) {
    url = endpoint;
  } else if (
    endpoint.startsWith('/mentor') ||
    endpoint.startsWith('mentor') ||
    endpoint.startsWith('/assessments') ||
    endpoint.startsWith('assessments') ||
    endpoint.startsWith('/roadmap') ||
    endpoint.startsWith('roadmap')
  ) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // If endpoint starts with /assessments, ensure prefix /mentor/assessments
    const routedEndpoint = cleanEndpoint.startsWith('/assessments')
      ? `/mentor${cleanEndpoint}`
      : cleanEndpoint;
    url = `${FASTAPI_BASE}${routedEndpoint}`;
  } else {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    url = cleanEndpoint.startsWith('/api') ? cleanEndpoint : `${API_BASE}${cleanEndpoint}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized / Expired Token
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
    const refreshToken = localStorage.getItem('pathai_refresh_token');
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const { accessToken } = await refreshRes.json();
          localStorage.setItem('pathai_access_token', accessToken);
          
          // Retry original request with new token
          headers['Authorization'] = `Bearer ${accessToken}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        } else {
          // Token refresh failed, clear local auth
          localStorage.removeItem('pathai_access_token');
          localStorage.removeItem('pathai_refresh_token');
          localStorage.removeItem('pathai_user');
        }
      } catch (err) {
        console.error('Token refresh exception:', err);
      }
    }
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: response.statusText };
    }
    throw new ApiError(
      response.status,
      errorData.error || errorData.message || `HTTP Error ${response.status}`,
      errorData
    );
  }

  return response.json() as Promise<T>;
}
