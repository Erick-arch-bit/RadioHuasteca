import { createHmac, timingSafeEqual } from 'node:crypto'
import { sql } from './db'

const secret = process.env.SESSION_SECRET
if (!secret || secret.length < 32) {
  throw new Error('Define SESSION_SECRET con al menos 32 caracteres.')
}
const sessionSecret: string = secret

export type AdminSession = { id: number; username: string; displayName: string; exp: number }

export function signSession(payload: Omit<AdminSession, 'exp'>) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url')
  return `${body}.${createHmac('sha256', sessionSecret).update(body).digest('base64url')}`
}

export function getSession(cookie?: string): AdminSession | null {
  const token = cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith('rh_admin='))?.slice(9)
  if (!token) return null
  const [body, signature] = token.split('.')
  if (!body || !signature) return null
  const expected = createHmac('sha256', sessionSecret).update(body).digest()
  const actual = Buffer.from(signature, 'base64url')
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString()) as AdminSession
    return data.exp > Date.now() ? data : null
  } catch {
    return null
  }
}

export async function getAdmin(headers: Record<string, string | undefined>) {
  const session = getSession(headers.cookie)
  if (!session) return null
  const [admin] = await sql`SELECT id, username, display_name AS "displayName", role FROM admin_users WHERE id = ${session.id}`
  return admin ? { ...session, role: admin.role as string } : null
}

export const clearSessionCookie = 'rh_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'
