/**
 * Integration smoke test. Boots nothing itself — expect a running server.
 * Usage: BASE=http://localhost:8787 node --experimental-strip-types test/api.smoke.ts
 * Uses a throwaway DB via env (set DATABASE_PATH to a temp file when starting the server).
 */
const BASE = process.env.BASE ?? 'http://localhost:8787'
import assert from 'node:assert/strict'

// Store cookies between calls.
let cookieJar: Record<string, string> = {}
function cookieHeader(): string {
  return Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join('; ')
}
function captureCookies(res: Response) {
  for (const set of res.headers.getSetCookie()) {
    const [pair] = set.split(';')
    const eq = pair.indexOf('=')
    cookieJar[pair.slice(0, eq)] = pair.slice(eq + 1)
  }
}
async function call(method: string, path: string, body?: unknown) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'content-type': 'application/json', cookie: cookieHeader() },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  captureCookies(res)
  const json = await res.json().catch(() => null)
  return { status: res.status, json }
}

const health = await call('GET', '/api/health')
assert.equal(health.status, 200)
assert.equal(health.json.service, 'dcs-auth-service')

// Unauthenticated session.
const anon = await call('GET', '/api/session')
assert.equal(anon.status, 401)

// Bad login.
const bad = await call('POST', '/api/login', { workId: 'nobody', password: 'wrong' })
assert.equal(bad.status, 401)

// Admin login from bootstrap env.
const workId = process.env.ADMIN_WORK_ID ?? 'admin'
const password = process.env.ADMIN_PASSWORD ?? ''
assert.ok(password, 'ADMIN_PASSWORD env required for smoke test')
const login = await call('POST', '/api/login', { workId, password })
assert.equal(login.status, 200, `login failed: ${JSON.stringify(login.json)}`)
assert.ok(cookieJar['dcs_at'] && cookieJar['dcs_rt'], 'cookies issued')

// Session with cookies.
const session = await call('GET', '/api/session')
assert.equal(session.status, 200)
assert.equal(session.json.user.workId, workId)

// Refresh rotates cookies.
const oldRt = cookieJar['dcs_rt']
const refresh = await call('POST', '/api/refresh')
assert.equal(refresh.status, 200)
assert.notEqual(cookieJar['dcs_rt'], oldRt, 'refresh token rotated')

// Refresh reuse detection: replaying the OLD token must fail…
cookieJar['dcs_rt'] = oldRt
const replay = await call('POST', '/api/refresh')
assert.equal(replay.status, 401, 'replayed refresh token rejected')

// Logout revokes everything.
const logout = await call('POST', '/api/logout')
assert.equal(logout.status, 200)
const after = await call('GET', '/api/session')
assert.equal(after.status, 401, 'session dead after logout')

console.log('auth-service smoke test: all assertions passed')
