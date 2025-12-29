// Base API client with error handling

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'Bir hata oluştu');
  }

  return data as T;
}

export function getApi<T>(url: string): Promise<T> {
  return fetchApi<T>(url, { method: 'GET' });
}

export function postApi<T>(url: string, body?: unknown): Promise<T> {
  return fetchApi<T>(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function patchApi<T>(url: string, body: unknown): Promise<T> {
  return fetchApi<T>(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteApi<T>(url: string): Promise<T> {
  return fetchApi<T>(url, { method: 'DELETE' });
}
