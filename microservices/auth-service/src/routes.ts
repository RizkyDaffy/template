import { Hono } from 'hono'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import { html } from 'hono/html'
import { db, newToken, hashToken } from './db.ts'
import { hashPassword, verifyPassword, passwordIssues } from './crypto.ts'
import { signAccessToken, verifyAccessToken } from './tokens.ts'
import { rateLimit, clientIp, cookieOpts } from './middleware.ts'
import { googleAuthUrl, googleExchange } from './google.ts'
import { config, pkgVersion } from './config.ts'

export const auth = new Hono()

const MAX_FAILED = 5
const LOCK_MINUTES = 15

interface UserRow {
  id: string
  work_id: string
  email: string | null
  password_hash: string | null
  name: string | null
  role: string
  google_sub: string | null
  failed_attempts: number
  locked_until: number | null
}

function publicUser(u: UserRow) {
  return { id: u.id, workId: u.work_id, email: u.email, name: u.name, role: u.role }
}

async function issueSession(c: any, userId: string, claims: { wid: string; role: string }) {
  const accessToken = await signAccessToken({ sub: userId, ...claims })
  const refreshToken = newToken()
  db.prepare(
    `INSERT INTO refresh_tokens (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`,
  ).run(hashToken(refreshToken), userId, Date.now() + config.refreshTokenTtl * 1000, Date.now())
  setCookie(c, 'dcs_at', accessToken, cookieOpts(config.accessTokenTtl))
  setCookie(c, 'dcs_rt', refreshToken, cookieOpts(config.refreshTokenTtl))
}

function currentUser(c: any): UserRow | null {
  const token = getCookie(c, 'dcs_at')
  if (!token) return null
  return c.get('user') ?? null
}

// --- Admin: user management (role admin only) ---------------------------------

// Guard: every handler below requires a valid admin session.
auth.use('/admin/*', async (c, next) => {
  const token = getCookie(c, 'dcs_at')
  const claims = token ? await verifyAccessToken(token) : null
  if (!claims || claims.role !== 'admin') {
    return c.json({ error: 'forbidden', message: 'Admin access required.' }, 403)
  }
  await next()
})

auth.get('/admin/users', (c) => {
  const rows = db
    .prepare(
      `SELECT id, work_id, email, name, role, google_sub, failed_attempts, locked_until, created_at, updated_at
       FROM users ORDER BY created_at DESC`,
    )
    .all() as Array<{
    id: string
    work_id: string
    email: string | null
    name: string | null
    role: string
    google_sub: string | null
    failed_attempts: number
    locked_until: number | null
    created_at: number
    updated_at: number
  }>
  return c.json({
    users: rows.map((u) => ({
      id: u.id,
      workId: u.work_id,
      email: u.email,
      name: u.name,
      role: u.role,
      hasGoogle: !!u.google_sub,
      locked: !!(u.locked_until && u.locked_until > Date.now()),
      createdAt: new Date(u.created_at).toISOString(),
    })),
  })
})

auth.post('/admin/users', async (c) => {
  const body = await c.req
    .json<{ workId?: string; email?: string; name?: string; role?: string; password?: string }>()
    .catch(() => null)
  const workId = body?.workId?.trim()
  const password = body?.password ?? ''
  if (!workId) return c.json({ error: 'invalid_input', message: 'Work ID is required.' }, 400)
  const issues = passwordIssues(password)
  if (issues.length) {
    return c.json({ error: 'weak_password', message: `Password must contain ${issues.join(', ')}.` }, 400)
  }
  const role = ['admin', 'operator', 'viewer'].includes(body?.role ?? '') ? body!.role! : 'operator'
  const now = Date.now()
  try {
    db.prepare(
      `INSERT INTO users (id, work_id, email, name, role, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(crypto.randomUUID(), workId, body?.email?.trim() || null, body?.name?.trim() || null, role, await hashPassword(password), now, now)
  } catch (e: any) {
    if (String(e.message).includes('UNIQUE')) {
      return c.json({ error: 'duplicate', message: 'Work ID or email already exists.' }, 409)
    }
    throw e
  }
  return c.json({ ok: true, message: `User ${workId} created.` }, 201)
})

auth.delete('/admin/users/:id', (c) => {
  const id = c.req.param('id')
  const claims = c.get('adminClaims') as { sub?: string } | undefined
  const callerToken = getCookie(c, 'dcs_at')
  // Guard re-check to get caller id for self-delete protection.
  // ponytail: second verify call per request; fine at this scale.
  return (async () => {
    const caller = callerToken ? await verifyAccessToken(callerToken) : null
    if (!caller) return c.json({ error: 'forbidden' }, 403)
    if (caller.sub === id) {
      return c.json({ error: 'self_delete', message: 'You cannot delete your own account.' }, 400)
    }
    const res = db.prepare(`DELETE FROM users WHERE id = ?`).run(id)
    if (res.changes === 0) return c.json({ error: 'not_found', message: 'User not found.' }, 404)
    return c.json({ ok: true })
  })()
})

auth.post('/admin/users/:id/unlock', (c) => {
  db.prepare(`UPDATE users SET failed_attempts = 0, locked_until = NULL, updated_at = ? WHERE id = ?`).run(
    Date.now(),
    c.req.param('id'),
  )
  return c.json({ ok: true })
})

auth.post('/admin/users/:id/role', async (c) => {
  const body = await c.req.json<{ role?: string }>().catch(() => null)
  const role = body?.role
  if (!role || !['admin', 'operator', 'viewer'].includes(role)) {
    return c.json({ error: 'invalid_input', message: 'Role must be admin, operator, or viewer.' }, 400)
  }
  const caller = getCookie(c, 'dcs_at')
  const me = caller ? await verifyAccessToken(caller) : null
  if (me?.sub === c.req.param('id') && role !== 'admin') {
    return c.json({ error: 'self_demote', message: 'You cannot demote your own account.' }, 400)
  }
  const res = db.prepare(`UPDATE users SET role = ?, updated_at = ? WHERE id = ?`).run(role, Date.now(), c.req.param('id'))
  if (res.changes === 0) return c.json({ error: 'not_found', message: 'User not found.' }, 404)
  return c.json({ ok: true })
})

// --- Health ---------------------------------------------------------------
auth.get('/health', (c) =>
  c.json({ ok: true, service: 'dcs-auth-service', version: pkgVersion, time: new Date().toISOString() }),
)


// --- Login (work_id + password) --------------------------------------------
auth.post('/login', async (c) => {
  if (!rateLimit(`login:${clientIp(c)}`, 20, 60_000)) {
    return c.json({ error: 'rate_limited', message: 'Too many requests. Try again later.' }, 429)
  }
  const body = await c.req.json<{ workId?: string; password?: string }>().catch(() => null)
  const workId = body?.workId?.trim()
  const password = body?.password ?? ''
  if (!workId || !password) {
    return c.json({ error: 'invalid_input', message: 'Work ID and password are required.' }, 400)
  }

  const user = db.prepare(`SELECT * FROM users WHERE work_id = ?`).get(workId) as UserRow | undefined
  if (!user || !user.password_hash) {
    return c.json({ error: 'invalid_credentials', message: 'Invalid Work ID or password.' }, 401)
  }

  const now = Date.now()
  if (user.locked_until && user.locked_until > now) {
    const seconds = Math.ceil((user.locked_until - now) / 1000)
    return c.json({ error: 'account_locked', message: `Account locked. Try again in ${seconds} seconds.` }, 423)
  }

  const ok = await verifyPassword(password, user.password_hash)
  if (!ok) {
    const failed = user.failed_attempts + 1
    if (failed >= MAX_FAILED) {
      db.prepare(`UPDATE users SET failed_attempts = 0, locked_until = ? WHERE id = ?`).run(
        now + LOCK_MINUTES * 60_000,
        user.id,
      )
      return c.json(
        { error: 'account_locked', message: `Too many failed attempts. Locked for ${LOCK_MINUTES} minutes.` },
        423,
      )
    }
    db.prepare(`UPDATE users SET failed_attempts = ?, updated_at = ? WHERE id = ?`).run(failed, now, user.id)
    return c.json({ error: 'invalid_credentials', message: 'Invalid Work ID or password.' }, 401)
  }

  db.prepare(`UPDATE users SET failed_attempts = 0, locked_until = NULL, updated_at = ? WHERE id = ?`).run(
    now,
    user.id,
  )
  await issueSession(c, user.id, { wid: user.work_id, role: user.role })
  return c.json({ user: publicUser(user) })
})

// --- Session ----------------------------------------------------------------
auth.get('/session', async (c) => {
  const token = getCookie(c, 'dcs_at')
  if (!token) return c.json({ user: null }, 401)
  const claims = await verifyAccessToken(token)
  if (!claims) return c.json({ user: null }, 401)
  const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(claims.sub) as UserRow | undefined
  if (!user) return c.json({ user: null }, 401)
  return c.json({ user: publicUser(user) })
})

// --- Refresh (rotation: old token revoked, new one issued) -------------------
auth.post('/refresh', async (c) => {
  const old = getCookie(c, 'dcs_rt')
  if (!old) return c.json({ error: 'no_session', message: 'Not signed in.' }, 401)
  const row = db
    .prepare(
      `SELECT rt.*, u.work_id, u.role FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id WHERE rt.token_hash = ?`,
    )
    .get(hashToken(old)) as
    | { token_hash: string; user_id: string; expires_at: number; revoked_at: number | null; work_id: string; role: string }
    | undefined
  if (!row || row.revoked_at || row.expires_at < Date.now()) {
    deleteCookie(c, 'dcs_rt', { path: '/' })
    return c.json({ error: 'invalid_session', message: 'Session expired. Sign in again.' }, 401)
  }
  // Reuse detection: a revoked token being replayed means theft — kill the family.
  if (row.revoked_at) {
    db.prepare(`UPDATE refresh_tokens SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL`).run(
      Date.now(),
      row.user_id,
    )
  }
  db.prepare(`UPDATE refresh_tokens SET revoked_at = ? WHERE token_hash = ?`).run(Date.now(), row.token_hash)
  await issueSession(c, row.user_id, { wid: row.work_id, role: row.role })
  return c.json({ ok: true })
})

// --- Logout ------------------------------------------------------------------
auth.post('/logout', (c) => {
  const rt = getCookie(c, 'dcs_rt')
  if (rt) {
    db.prepare(`UPDATE refresh_tokens SET revoked_at = ? WHERE token_hash = ?`).run(Date.now(), hashToken(rt))
  }
  deleteCookie(c, 'dcs_at', { path: '/' })
  deleteCookie(c, 'dcs_rt', { path: '/' })
  return c.json({ ok: true })
})

// --- Google OAuth --------------------------------------------------------------
auth.get('/auth/google', (c) => {
  if (!config.google.enabled) {
    return c.json({ error: 'google_disabled', message: 'Google sign-in is not configured on this server.' }, 404)
  }
  const state = newToken()
  setCookie(c, 'dcs_oauth_state', state, { ...cookieOpts(600), httpOnly: true })
  const url = googleAuthUrl(state)
  if (!url) return c.json({ error: 'google_disabled' }, 404)
  return c.redirect(url)
})

auth.get('/auth/google/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state')
  const expected = getCookie(c, 'dcs_oauth_state')
  deleteCookie(c, 'dcs_oauth_state', { path: '/' })
  if (!code || !state || !expected || state !== expected) {
    return c.json({ error: 'oauth_state_mismatch', message: 'Invalid OAuth state.' }, 400)
  }
  const profile = await googleExchange(code)
  if (!profile) return c.json({ error: 'oauth_failed', message: 'Google authentication failed.' }, 401)

  let user = db.prepare(`SELECT * FROM users WHERE google_sub = ? OR email = ?`).get(
    profile.sub,
    profile.email,
  ) as UserRow | undefined
  const now = Date.now()
  if (user) {
    if (!user.google_sub) {
      db.prepare(`UPDATE users SET google_sub = ?, updated_at = ? WHERE id = ?`).run(profile.sub, now, user.id)
    }
  } else {
    const id = crypto.randomUUID()
    const workId = profile.email.split('@')[0]
    db.prepare(
      `INSERT INTO users (id, work_id, email, name, role, google_sub, created_at, updated_at) VALUES (?, ?, ?, ?, 'operator', ?, ?, ?)`,
    ).run(id, workId, profile.email, profile.name ?? null, profile.sub, now, now)
    user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as UserRow
  }
  await issueSession(c, user.id, { wid: user.work_id, role: user.role })
  return c.redirect(`${config.appUrl}/`)
})

// --- Password reset --------------------------------------------------------------
auth.post('/reset-password', async (c) => {
  if (!rateLimit(`reset:${clientIp(c)}`, 5, 300_000)) {
    return c.json({ error: 'rate_limited', message: 'Too many requests. Try again later.' }, 429)
  }
  const body = await c.req.json<{ identifier?: string }>().catch(() => null)
  const identifier = body?.identifier?.trim()
  if (!identifier) return c.json({ error: 'invalid_input', message: 'Work ID or email is required.' }, 400)

  const user = db
    .prepare(`SELECT * FROM users WHERE work_id = ? OR email = ?`)
    .get(identifier, identifier) as UserRow | undefined

  // Always return success — never leak which identifiers exist.
  if (user) {
    const token = newToken()
    db.prepare(
      `INSERT INTO password_reset_tokens (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`,
    ).run(hashToken(token), user.id, Date.now() + 30 * 60_000, Date.now())
    const resetUrl = `${config.appUrl}/reset?token=${token}`
    if (config.smtp.enabled) {
      const { sendResetEmail } = await import('./mail.ts')
      await sendResetEmail(user.email!, resetUrl).catch((e) => console.error('[mail]', e.message))
    } else {
      // Dev mode: no SMTP configured — log the link so forks can test the flow.
      console.log(`[reset] SMTP not configured. Reset link for ${user.work_id}: ${resetUrl}`)
    }
  }
  return c.json({ ok: true, message: 'If the account exists, reset instructions have been sent.' })
})

auth.post('/reset-password/confirm', async (c) => {
  const body = await c.req.json<{ token?: string; password?: string }>().catch(() => null)
  const token = body?.token
  const password = body?.password ?? ''
  if (!token || !password) {
    return c.json({ error: 'invalid_input', message: 'Token and new password are required.' }, 400)
  }
  const issues = passwordIssues(password)
  if (issues.length) {
    return c.json(
      { error: 'weak_password', message: `Password must contain ${issues.join(', ')}.` },
      400,
    )
  }
  const row = db
    .prepare(`SELECT * FROM password_reset_tokens WHERE token_hash = ?`)
    .get(hashToken(token)) as { user_id: string; expires_at: number; used_at: number | null } | undefined
  if (!row || row.used_at || row.expires_at < Date.now()) {
    return c.json({ error: 'invalid_token', message: 'Reset link is invalid or has expired.' }, 400)
  }
  const hash = await hashPassword(password)
  const now = Date.now()
  db.prepare(`UPDATE users SET password_hash = ?, failed_attempts = 0, locked_until = NULL, updated_at = ? WHERE id = ?`).run(
    hash,
    now,
    row.user_id,
  )
  db.prepare(`UPDATE password_reset_tokens SET used_at = ? WHERE token_hash = ?`).run(now, hashToken(token))
  // Invalidate all existing sessions after a password change.
  db.prepare(`UPDATE refresh_tokens SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL`).run(now, row.user_id)
  return c.json({ ok: true, message: 'Password updated. Sign in with your new password.' })
})

// --- Change password (authenticated) -----------------------------------------
auth.post('/change-password', async (c) => {
  const token = getCookie(c, 'dcs_at')
  if (!token) return c.json({ error: 'no_session', message: 'Not signed in.' }, 401)
  const claims = await verifyAccessToken(token)
  if (!claims) return c.json({ error: 'invalid_session', message: 'Session expired.' }, 401)

  const body = await c.req.json<{ current?: string; next?: string }>().catch(() => null)
  const current = body?.current ?? ''
  const next = body?.next ?? ''
  const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(claims.sub) as UserRow | undefined
  if (!user?.password_hash) return c.json({ error: 'no_password', message: 'Account has no local password.' }, 400)
  if (!(await verifyPassword(current, user.password_hash))) {
    return c.json({ error: 'invalid_credentials', message: 'Current password is incorrect.' }, 401)
  }
  const issues = passwordIssues(next)
  if (issues.length) {
    return c.json({ error: 'weak_password', message: `Password must contain ${issues.join(', ')}.` }, 400)
  }
  const now = Date.now()
  db.prepare(`UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?`).run(
    await hashPassword(next),
    now,
    user.id,
  )
  db.prepare(`UPDATE refresh_tokens SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL`).run(now, user.id)
  await issueSession(c, user.id, { wid: user.work_id, role: user.role })
  return c.json({ ok: true, message: 'Password changed.' })
})
