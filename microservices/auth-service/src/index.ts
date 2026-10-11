import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { config, pkgVersion } from './config.ts'
import { db } from './db.ts'
import { hashPassword } from './crypto.ts'
import { auth } from './routes.ts'
import { verifyAccessToken } from './tokens.ts'
import { getCookie } from 'hono/cookie'

const app = new Hono()

app.use(secureHeaders())
app.use(
  '/api/*',
  cors({
    origin: config.corsOrigins,
    credentials: true,
  }),
)

// Attach user claims to context for downstream handlers.
app.use('/api/*', async (c, next) => {
  const token = getCookie(c, 'dcs_at')
  if (token) {
    const claims = await verifyAccessToken(token)
    if (claims) c.set('user', claims)
  }
  await next()
})

app.route('/api', auth)

// 404 JSON, never HTML.
app.notFound((c) => c.json({ error: 'not_found' }, 404))
app.onError((err, c) => {
  console.error('[error]', err)
  return c.json({ error: 'internal_error', message: 'Unexpected server error.' }, 500)
})

// --- Bootstrap admin (first run only) ---------------------------------------
const userCount = (db.prepare(`SELECT COUNT(*) AS n FROM users`).get() as { n: number }).n
if (userCount === 0 && config.admin.password) {
  const now = Date.now()
  db.prepare(
    `INSERT INTO users (id, work_id, email, password_hash, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'admin', ?, ?)`,
  ).run(crypto.randomUUID(), config.admin.workId, config.admin.email || null, await hashPassword(config.admin.password), 'Administrator', now, now)
  console.log(`[bootstrap] Admin user "${config.admin.workId}" created. Remove ADMIN_* env vars now.`)
} else if (userCount === 0) {
  console.warn('[bootstrap] No users and no ADMIN_PASSWORD set — run with ADMIN_PASSWORD once to create the admin.')
}

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`dcs-auth-service v${pkgVersion} listening on :${info.port}`)
  console.log(`  db:      ${config.dbPath}`)
  console.log(`  origins: ${config.corsOrigins.join(', ')}`)
  console.log(`  google:  ${config.google.enabled ? 'enabled' : 'disabled'}`)
  console.log(`  smtp:    ${config.smtp.enabled ? 'enabled' : 'disabled (reset links logged to console)'}`)
})
