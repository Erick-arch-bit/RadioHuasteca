import { createHmac, timingSafeEqual } from 'node:crypto'
import { sql } from './db'

const secret = process.env.SESSION_SECRET
if (!secret || secret.length < 32) throw new Error('Define SESSION_SECRET con al menos 32 caracteres.')
const sessionSecret: string = secret

export type AdminSession = { id: string; username: string; displayName: string; role: string; exp: number }
export const operatorRoles = ['admin', 'moderator', 'operator']

const encodedHeader = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')

export function signSession(payload: Omit<AdminSession, 'exp'>) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 })).toString('base64url')
  const unsigned = `${encodedHeader}.${body}`
  return `${unsigned}.${createHmac('sha256', sessionSecret).update(unsigned).digest('base64url')}`
}

export function getSession(cookie?: string): AdminSession | null {
  const token = cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith('rh_admin='))?.slice(9)
  if (!token) return null
  const [header, body, signature] = token.split('.')
  if (!header || !body || !signature || header !== encodedHeader) return null
  const unsigned = `${header}.${body}`
  const expected = createHmac('sha256', sessionSecret).update(unsigned).digest()
  const actual = Buffer.from(signature, 'base64url')
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString()) as AdminSession
    return data.exp > Math.floor(Date.now() / 1000) ? data : null
  } catch {
    return null
  }
}

export async function getAdmin(headers: Record<string, string | undefined>) {
  const origin = process.env.FRONTEND_ORIGIN
  if (origin && headers.origin && headers.origin !== new URL(origin).origin) return null
  const session = getSession(headers.cookie)
  if (!session) return null
  const [admin] = await sql`SELECT id, username, display_name, role FROM users WHERE id = ${session.id} AND is_active = true`
  return admin ? { ...session, displayName: admin.display_name, role: admin.role } : null
}

export function hasOperatorRole(admin: AdminSession | null | undefined) {
  return Boolean(admin && operatorRoles.includes(admin.role))
}

export function clearSessionCookie(isCrossOrigin = false) {
  return `rh_admin=; HttpOnly; SameSite=${isCrossOrigin ? 'None' : 'Strict'}; Path=/; Max-Age=0${isCrossOrigin ? '; Secure' : ''}`
}
