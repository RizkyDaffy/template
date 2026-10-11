import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>

// OWASP-recommended scrypt parameters (minimum: N=2^17, r=8, p=1).
// Memory use = 128*N*r ≈ 256MB — maxmem must cover it.
const PARAMS = { N: 1 << 17, r: 8, p: 1, maxmem: 512 * 1024 * 1024 }

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await scrypt(password.normalize('NFKC'), salt, 64, PARAMS)
  return `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt.toString('base64')}$${key.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false
  const [, N, r, p, saltB64, keyB64] = parts
  const key = await scrypt(
    password.normalize('NFKC'),
    Buffer.from(saltB64, 'base64'),
    Buffer.from(keyB64, 'base64').length,
    { N: Number(N), r: Number(r), p: Number(p), maxmem: 512 * 1024 * 1024 },
  )
  return timingSafeEqual(key, Buffer.from(keyB64, 'base64'))
}

export function passwordIssues(pw: string): string[] {
  const issues: string[] = []
  if (pw.length < 8) issues.push('at least 8 characters')
  if (!/[a-z]/.test(pw)) issues.push('a lowercase letter')
  if (!/[A-Z]/.test(pw)) issues.push('an uppercase letter')
  if (!/[0-9]/.test(pw)) issues.push('a digit')
  return issues
}
