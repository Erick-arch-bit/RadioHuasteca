import { Elysia, t } from 'elysia'
import { getAdmin, clearSessionCookie, signSession } from '../auth'
import { sql } from '../db'
import { uploadToCloudinary } from '../cloudinary'

const noticeSchema = t.Object({
  title: t.String({ minLength: 1, maxLength: 150 }),
  description: t.Optional(t.String({ maxLength: 5000 })),
  summary: t.Optional(t.String({ maxLength: 5000 })),
  priority: t.Optional(t.String({ maxLength: 20 })),
  status: t.Optional(t.String({ maxLength: 20 })),
  mediaUrl: t.Optional(t.Union([t.String(), t.Null()])),
  mediaPublicId: t.Optional(t.Union([t.String(), t.Null()])),
  imageUrl: t.Optional(t.Union([t.String(), t.Null()])),
  imagePublicId: t.Optional(t.Union([t.String(), t.Null()])),
})

async function requireAdmin(headers: Record<string, string | undefined>, set: { status?: number | string }) {
  const admin = await getAdmin(headers)
  if (!admin) set.status = 401
  return admin
}

export const adminRoutes = new Elysia({ prefix: '/api' })
  .post('/auth/login', async ({ body, headers, set }) => {
    const [admin] = await sql`
      SELECT id, username, email FROM admins
      WHERE (lower(username) = lower(${body.username.trim()}) OR lower(email) = lower(${body.username.trim()}))
        AND password_hash = crypt(${body.password}, password_hash)
    `
    if (!admin) { set.status = 401; return { message: 'Usuario o contraseña incorrectos.' } }
    const origin = process.env.FRONTEND_ORIGIN
    if (origin && headers.origin && headers.origin !== new URL(origin).origin) {
      set.status = 403
      return { message: 'Origen no autorizado.' }
    }
    set.headers['Set-Cookie'] = `rh_admin=${signSession({ id: String(admin.id), username: admin.username, displayName: admin.username })}; HttpOnly; SameSite=${origin ? 'None' : 'Strict'}; Path=/; Max-Age=28800${origin ? '; Secure' : ''}`
    return { user: { id: admin.id, displayName: admin.username, role: 'operator' } }
  }, { body: t.Object({ username: t.String(), password: t.String() }) })
  .get('/auth/me', async ({ headers, set }) => {
    const admin = await requireAdmin(headers, set)
    if (!admin) return { message: 'Inicia sesión para continuar.' }
    return { user: { id: admin.id, displayName: admin.displayName, role: admin.role } }
  })
  .post('/auth/logout', ({ set }) => {
    set.headers['Set-Cookie'] = clearSessionCookie
    return { ok: true }
  })
  .get('/admin/summary', async ({ headers, set }) => {
    const admin = await requireAdmin(headers, set)
    if (!admin) return { message: 'Inicia sesión para continuar.' }
    return (await sql`SELECT count(*)::int AS procedures, count(*) FILTER (WHERE is_priority)::int AS priority_procedures FROM procedures`)[0]
  })
  .get('/admin/notices', async ({ headers, set }) => {
    const admin = await requireAdmin(headers, set)
    if (!admin) return { message: 'Inicia sesión para continuar.' }
    return sql`SELECT id, title, summary AS description, priority, status, audio_url AS "mediaUrl", image_url AS "imageUrl", to_char(created_at, 'YYYY-MM-DD') AS date FROM notices ORDER BY created_at DESC`
  })
  .post('/admin/notices', async ({ body, headers, set }) => {
    const admin = await requireAdmin(headers, set)
    if (!admin) return { message: 'Inicia sesión para continuar.' }
    const [notice] = await sql`
      INSERT INTO notices (title, summary, priority, status, audio_url, audio_public_id,
        image_url, image_public_id, created_by)
      VALUES (${body.title.trim()}, ${body.summary ?? body.description ?? null}, ${body.priority ?? 'normal'},
        ${body.status ?? 'active'}, ${body.mediaUrl ?? null}, ${body.mediaPublicId ?? null},
        ${body.imageUrl ?? null}, ${body.imagePublicId ?? null}, ${admin.id})
      RETURNING id
    `
    set.status = 201
    return { id: notice.id, message: 'Aviso guardado.' }
  }, { body: noticeSchema })
  .patch('/admin/notices/:id', async ({ body, params, headers, set }) => {
    const admin = await requireAdmin(headers, set)
    if (!admin) return { message: 'Inicia sesión para continuar.' }
    const result = await sql`
      UPDATE notices SET title=${body.title.trim()}, summary=${body.summary ?? body.description ?? null},
        priority=${body.priority ?? 'normal'}, status=${body.status ?? 'active'},
        audio_url=${body.mediaUrl ?? null}, audio_public_id=${body.mediaPublicId ?? null},
        image_url=${body.imageUrl ?? null}, image_public_id=${body.imagePublicId ?? null}
      WHERE id=${params.id.replace('community-', '')}
    `
    if (result.count === 0) { set.status = 404; return { message: 'Aviso no encontrado.' } }
    return { message: 'Aviso actualizado.' }
  }, { body: noticeSchema })
  .post('/audios', async ({ body, headers, set }) => {
    const admin = await requireAdmin(headers, set)
    if (!admin) return { message: 'Inicia sesión para continuar.' }
    if (!body.file.type.startsWith('audio/')) { set.status = 400; return { message: 'Fonoteca solo acepta archivos de audio.' } }
    const asset = await uploadToCloudinary(await body.file.arrayBuffer(), 'video')
    const [capsule] = await sql`
      INSERT INTO capsules (title, description, audio_url, audio_public_id, duration_seconds, category, language)
      VALUES (${body.title.trim()}, ${(body.description ?? '').slice(0, 5000)}, ${asset.url},
        ${asset.publicId}, ${Math.round(Number(body.duration))}, ${body.category?.trim() || 'Comunidad'}, ${body.language?.trim() || 'Español'})
      RETURNING id
    `
    return { id: capsule.id, message: 'Audio cargado correctamente.' }
  }, { body: t.Object({
    file: t.File({ maxSize: '50m', type: 'audio/*' }), title: t.String(), category: t.Optional(t.String()),
    language: t.Optional(t.String()), duration: t.String(), description: t.Optional(t.String()),
  }) })
