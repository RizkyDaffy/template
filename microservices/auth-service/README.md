# dcs-auth-service

Authentication microservice for DCS (Digital Control System). Zero-config for
forks: SQLite by default, all settings in `.env` (see `.env.example`).

## Quick start

```bash
npm install
cp .env.example .env
# generate a JWT secret:
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
# paste into JWT_SECRET in .env, set ADMIN_PASSWORD, then:
npm run dev
```

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET  | `/api/health` | Service health + version |
| POST | `/api/login` | `{ workId, password }` — sets httpOnly cookies |
| GET  | `/api/session` | Current user (401 when signed out) |
| POST | `/api/refresh` | Rotate refresh token, new access token |
| POST | `/api/logout` | Revoke session |
| GET  | `/api/auth/google` | Start Google OAuth (404 when not configured) |
| GET  | `/api/auth/google/callback` | OAuth callback |
| POST | `/api/reset-password` | Request reset link `{ identifier }` |
| POST | `/api/reset-password/confirm` | `{ token, password }` |
| POST | `/api/change-password` | Authenticated `{ current, next }` |

## Security notes

- Passwords: scrypt (OWASP params), timing-safe comparison.
- Sessions: short-lived HS256 JWT (15 min) in httpOnly cookie + rotating
  refresh token (30 days) with reuse detection — replaying a revoked token
  revokes the whole token family.
- Login lockout: 5 failed attempts locks 15 minutes, per account.
- Rate limiting: login 20/min per IP, password reset 5/5min per IP.
- Reset flow never reveals whether an identifier exists.
- All secrets/urls/ttl via `.env` — nothing hardcoded.

## Google OAuth setup

1. Google Cloud Console → Credentials → OAuth client (Web).
2. Authorized redirect URI: `{PUBLIC_API_URL}/auth/google/callback`
3. Put client id/secret in `.env`.
