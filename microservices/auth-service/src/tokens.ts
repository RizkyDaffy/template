import { SignJWT, jwtVerify } from 'jose'
import { config } from './config.ts'

const secret = new TextEncoder().encode(config.jwtSecret)

export interface AccessClaims {
  sub: string // user id
  wid: string // work_id
  role: string
}

export async function signAccessToken(claims: AccessClaims): Promise<string> {
  return new SignJWT({ wid: claims.wid, role: claims.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setIssuer('dcs-auth-service')
    .setAudience('dcs-api')
    .setExpirationTime(`${config.accessTokenTtl}s`)
    .sign(secret)
}

export async function verifyAccessToken(token: string): Promise<AccessClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'dcs-auth-service',
      audience: 'dcs-api',
    })
    if (!payload.sub || typeof payload.wid !== 'string' || typeof payload.role !== 'string') return null
    return { sub: payload.sub, wid: payload.wid, role: payload.role }
  } catch {
    return null
  }
}
