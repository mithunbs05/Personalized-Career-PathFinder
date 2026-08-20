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
  const token = localStorage.getItem('pathai_access_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

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
