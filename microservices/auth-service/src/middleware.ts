import { config } from './config.ts'

import type { Context } from 'hono'

// ponytail: naive fixed-window limiter keyed by ip+route; swap for a token
// bucket keyed by account if distributed deployments ever need it.
const buckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  b.count++
  return b.count <= limit
}

export function clientIp(c: Context): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
    c.req.header('x-real-ip') ??
    'unknown'
  )
}

export function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    secure: config.appUrl.startsWith('https://'),
    sameSite: 'Lax' as const,
    path: '/',
    maxAge,
  }
}
