import { config } from '../src/config.ts'
import { hashPassword, verifyPassword, passwordIssues } from '../src/crypto.ts'
import { signAccessToken, verifyAccessToken } from '../src/tokens.ts'
import { newToken, hashToken } from '../src/db.ts'
import assert from 'node:assert/strict'

// crypto
const hash = await hashPassword('Secret123')
assert.ok(hash.startsWith('scrypt$'), 'hash format')
assert.ok(await verifyPassword('Secret123', hash), 'correct password verifies')
assert.ok(!(await verifyPassword('wrong', hash)), 'wrong password rejected')
assert.ok(!(await verifyPassword('Secret123', 'garbage')), 'malformed hash rejected')
assert.deepEqual(passwordIssues('SHORT1'), ['at least 8 characters', 'a lowercase letter'])
assert.deepEqual(passwordIssues('Good123pass'), [], 'strong password passes')

// tokens
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-at-least-32-chars-long!!'
const token = await signAccessToken({ sub: 'u1', wid: 'admin', role: 'admin' })
const claims = await verifyAccessToken(token)
assert.ok(claims && claims.sub === 'u1' && claims.wid === 'admin', 'claims roundtrip')
assert.equal(await verifyAccessToken('tampered.token.here'), null, 'tampered token rejected')
assert.equal(await verifyAccessToken(token.slice(0, -2) + 'xx'), null, 'corrupted token rejected')

// db helpers
const t = newToken()
assert.equal(t.length, 43, 'token is base64url 32 bytes')
assert.equal(hashToken(t), hashToken(t), 'token hash deterministic')
assert.notEqual(hashToken(t), t, 'token hash differs from token')

// config safety
assert.ok(config.accessTokenTtl > 0, 'ttl positive')

console.log('auth-service self-check: all assertions passed')
