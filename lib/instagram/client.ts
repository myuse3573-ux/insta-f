/**
 * Official Meta Instagram API Client (Instagram Login / Business Login)
 * Base Host: https://graph.instagram.com/
 */

export function getInstagramApiVersion(): string {
  return process.env.INSTAGRAM_API_VERSION || 'v22.0';
}

export function getInstagramBaseUrl(): string {
  const version = getInstagramApiVersion();
  return `https://graph.instagram.com/${version}`;
}

export interface InstagramApiError {
  message: string;
  type?: string;
  code?: number;
  error_subcode?: number;
  fbtrace_id?: string;
}

export async function instagramApiFetch<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'DELETE';
    params?: Record<string, string>;
    body?: any;
    accessToken: string;
    timeoutMs?: number;
  }
): Promise<T> {
  const { method = 'GET', params = {}, body, accessToken, timeoutMs = 10000 } = options;

  const queryParams = new URLSearchParams({
    ...params,
    access_token: accessToken,
  });

  const baseUrl = getInstagramBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const url = `${baseUrl}${cleanEndpoint}?${queryParams.toString()}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
    signal: controller.signal,
  };

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, fetchOptions);
    clearTimeout(timer);

    const data = await res.json();

    if (!res.ok || data.error) {
      const err: InstagramApiError = data.error || { message: `HTTP Error ${res.status}` };
      console.error(`[Instagram API Error] ${method} ${endpoint} - Code: ${err.code || res.status} - ${err.message}`);

      if (err.code === 190) {
        throw new Error('Instagram authorization token expired or revoked. Please reconnect your account.');
      }
      if (err.code === 10 || err.code === 200 || err.code === 230) {
        throw new Error('Permission denied. Ensure your Meta App has instagram_business_manage_messages granted.');
      }
      if (err.code === 4 || err.code === 17 || err.code === 32) {
        throw new Error('Instagram API rate limit reached. Please wait a few minutes before trying again.');
      }
      throw new Error(err.message || 'Instagram API request failed');
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timer);
    if (error.name === 'AbortError') {
      throw new Error('Instagram API request timed out');
    }
    throw error;
  }
}
