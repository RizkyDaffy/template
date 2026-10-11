import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

function loadEnv() {
  // .env at the service root (config.ts lives in src/, so go up one level).
  const envPath = path.resolve(import.meta.dirname, '../.env')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let v = m[2]
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!(m[1] in process.env)) process.env[m[1]] = v
  }
}
loadEnv()

function required(name: string): string {
  const v = process.env[name]
  if (!v) {
    console.error(`[config] Missing required env var: ${name}. See .env.example`)
    process.exit(1)
  }
  return v
}

function int(name: string, fallback: number): number {
  const v = process.env[name]
  if (!v) return fallback
  const n = Number(v)
  if (!Number.isFinite(n) || n <= 0) {
    console.error(`[config] Invalid ${name}: "${v}" — must be a positive number`)
    process.exit(1)
  }
  return n
}

export const config = {
  port: int('PORT', 8787),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',').map((s) => s.trim()),
  dbPath: process.env.DATABASE_PATH ?? './data/dcs.db',
  jwtSecret: required('JWT_SECRET'),
  accessTokenTtl: int('ACCESS_TOKEN_TTL', 900),
  refreshTokenTtl: int('REFRESH_TOKEN_TTL', 60 * 60 * 24 * 30),
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    get enabled() {
      return this.clientId !== '' && this.clientSecret !== ''
    },
  },
  appUrl: process.env.APP_URL ?? 'http://localhost:5173',
  publicApiUrl: process.env.PUBLIC_API_URL ?? '',
  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: int('SMTP_PORT', 587),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.SMTP_FROM ?? 'DCS <no-reply@localhost>',
    get enabled() {
      return this.host !== '' && this.user !== ''
    },
  },
  admin: {
    workId: process.env.ADMIN_WORK_ID ?? 'admin',
    email: process.env.ADMIN_EMAIL ?? '',
    password: process.env.ADMIN_PASSWORD ?? '',
  },
}

export const pkgVersion: string = require('../package.json').version
