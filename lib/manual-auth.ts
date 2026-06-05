import 'server-only'
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export const AUTH_COOKIE_NAME = 'bf_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

export type SessionUser = {
  id: string
  email: string
  username: string | null
}

type SessionPayload = {
  sub: string
  email: string
  username: string | null
  exp: number
}

function getAuthSecret() {
  return process.env.AUTH_SECRET || 'dev-only-auth-secret-change-me'
}

function toBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(unsignedToken: string) {
  return createHmac('sha256', getAuthSecret()).update(unsignedToken).digest('base64url')
}

function parseCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null

  const cookiesList = cookieHeader.split(';')
  for (const part of cookiesList) {
    const [rawName, ...rest] = part.trim().split('=')
    if (rawName === name) {
      return rest.join('=')
    }
  }

  return null
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hashHex] = storedHash.split(':')
  if (!salt || !hashHex) return false

  const expected = Buffer.from(hashHex, 'hex')
  const computed = scryptSync(password, salt, expected.length)

  if (expected.length !== computed.length) return false
  return timingSafeEqual(expected, computed)
}

export function createSessionToken(user: SessionUser) {
  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    username: user.username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  }

  const payloadPart = toBase64Url(JSON.stringify(payload))
  const signature = sign(payloadPart)
  return `${payloadPart}.${signature}`
}

export function verifySessionToken(token: string): SessionUser | null {
  const [payloadPart, signature] = token.split('.')
  if (!payloadPart || !signature) return null

  const expectedSignature = sign(payloadPart)
  const a = Buffer.from(signature)
  const b = Buffer.from(expectedSignature)
  if (a.length !== b.length) return null
  if (!timingSafeEqual(a, b)) return null

  try {
    const payload = JSON.parse(fromBase64Url(payloadPart)) as SessionPayload
    if (!payload.sub || !payload.email || !payload.exp) return null
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null

    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username ?? null,
    }
  } catch {
    return null
  }
}

export function getTokenFromRequest(req?: NextRequest | Request) {
  const bearer = req?.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (bearer) return bearer

  if (req) {
    return parseCookieValue(req.headers.get('cookie'), AUTH_COOKIE_NAME)
  }

  return null
}

export async function getTokenFromServerCookies() {
  const cookieStore = await cookies()
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null
}
