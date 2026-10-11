import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { config } from './config.ts'

fs.mkdirSync(path.dirname(path.resolve(config.dbPath)), { recursive: true })
export const db = new Database(config.dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    work_id       TEXT NOT NULL UNIQUE COLLATE NOCASE,
    email         TEXT UNIQUE COLLATE NOCASE,
    password_hash TEXT,
    name          TEXT,
    role          TEXT NOT NULL DEFAULT 'operator',
    google_sub    TEXT UNIQUE,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until  INTEGER,
    created_at    INTEGER NOT NULL,
    updated_at    INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    token_hash  TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  INTEGER NOT NULL,
    created_at  INTEGER NOT NULL,
    revoked_at  INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_refresh_user ON refresh_tokens(user_id);

  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token_hash  TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  INTEGER NOT NULL,
    used_at     INTEGER,
    created_at  INTEGER NOT NULL
  );
`)

export function newToken(): string {
  return randomBytes(32).toString('base64url')
}

export function hashToken(token: string): string {
  // Tokens are high-entropy random values — SHA-256 is sufficient (NIST SP 800-131A).
  // Do NOT reuse this for low-entropy passwords (use scrypt from crypto.ts).
  return createHashSha256(token)
}

import { createHash } from 'node:crypto'
function createHashSha256(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}
