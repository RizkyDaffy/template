/**
 * DCS API client. All calls go to the auth microservice (see
 * microservices/auth-service). Session lives in httpOnly cookies set by the
 * server — no tokens are stored in JS, so XSS cannot steal them.
 */

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787'

export interface DcsUser {
  id: string
  workId: string
  email: string | null
  name: string | null
  role: string
}

export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      ...init,
    })
  } catch {
    throw new ApiError(0, 'network_error', 'Koneksi ke server terputus, coba lagi nanti.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(
      res.status,
      (data as { error?: string }).error ?? 'unknown_error',
      (data as { message?: string }).message ?? 'Terjadi kesalahan, coba lagi.',
    )
  }
  return data as T
}

export const api = {
  health: () => call<{ ok: boolean; version: string }>('/api/health'),

  login: (workId: string, password: string) =>
    call<{ user: DcsUser }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ workId, password }),
    }),

  session: () => call<{ user: DcsUser | null }>('/api/session'),

  logout: () => call<{ ok: true }>('/api/logout', { method: 'POST' }),

  requestReset: (identifier: string) =>
    call<{ ok: true; message: string }>('/api/reset-password', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    }),

  confirmReset: (token: string, password: string) =>
    call<{ ok: true; message: string }>('/api/reset-password/confirm', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),

  googleUrl: `${API_BASE_URL}/api/auth/google`,
}
