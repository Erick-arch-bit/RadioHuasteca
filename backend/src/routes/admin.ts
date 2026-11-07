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
      SELECT id, username, email, display_name, role FROM users
      WHERE (lower(username) = lower(${body.username.trim()}) OR lower(email) = lower(${body.username.trim()}))
        AND password_hash = crypt(${body.password}, password_hash) AND is_active = true
    `
    if (!admin) { set.status = 401; return { message: 'Usuario o contraseña incorrectos.' } }
    const origin = process.env.FRONTEND_ORIGIN
    if (origin && headers.origin && headers.origin !== new URL(origin).origin) {
      set.status = 403
      return { message: 'Origen no autorizado.' }
    }
    set.headers['Set-Cookie'] = `rh_admin=${signSession({ id: String(admin.id), username: admin.username, displayName: admin.display_name, role: admin.role })}; HttpOnly; SameSite=${origin ? 'None' : 'Strict'}; Path=/; Max-Age=86400${origin ? '; Secure' : ''}`
    await sql`UPDATE users SET last_login = NOW() WHERE id = ${admin.id}`
    return { user: { id: admin.id, displayName: admin.display_name, role: admin.role } }
  }, { body: t.Object({ username: t.String(), password: t.String() }) })
  .get('/auth/me', async ({ headers, set }) => {
    const admin = await requireAdmin(headers, set)
    if (!admin) return { message: 'Inicia sesión para continuar.' }
    return { user: { id: admin.id, displayName: admin.displayName, role: admin.role } }
  })
  .post('/auth/logout', ({ set }) => {
    set.headers['Set-Cookie'] = clearSessionCookie(Boolean(process.env.FRONTEND_ORIGIN))
    return { ok: true }
  })
  .get('/admin/summary', async ({ headers, set }) => {
    const admin = await requireAdmin(headers, set)
    if (!admin) return { message: 'Inicia sesión para continuar.' }
    const [stats] = await sql`SELECT
      (SELECT count(*)::int FROM notices WHERE status = 'pending') AS pending_notices,
      (SELECT count(*)::int FROM mailbox WHERE status = 'pending') AS unread_mailbox,
      (SELECT count(*)::int FROM procedures) AS procedures,
      (SELECT count(*)::int FROM capsules) AS capsules,
      (SELECT publish_date::text FROM bulletins ORDER BY publish_date DESC LIMIT 1) AS latest_bulletin,
      (SELECT count(*) FILTER (WHERE is_priority)::int FROM procedures) AS priority_procedures`
    return stats
  })
  .get('/admin/stats', async ({ headers, set }) => {
    const admin = await requireAdmin(headers, set)
    if (!admin) return { message: 'Inicia sesión para continuar.' }
    const [stats] = await sql`SELECT
      (SELECT count(*)::int FROM notices WHERE status = 'pending') AS pending_notices,
      (SELECT count(*)::int FROM mailbox WHERE status = 'pending') AS unread_mailbox,
      (SELECT count(*)::int FROM procedures) AS procedures,
      (SELECT count(*)::int FROM capsules) AS capsules,
      (SELECT publish_date::text FROM bulletins ORDER BY publish_date DESC LIMIT 1) AS latest_bulletin`
    return stats
  })
  .get('/admin/notices', async ({ headers, set }) => {
    const admin = await requireAdmin(headers, set)
    if (!admin) return { message: 'Inicia sesión para continuar.' }
    return sql`SELECT id, title, summary AS description, priority, status, category, audio_url, image_url,
      to_char(created_at, 'YYYY-MM-DD') AS date FROM notices WHERE status = 'pending' ORDER BY created_at DESC`
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
    const asset = await uploadToCloudinary(await body.file.arrayBuffer(), 'video', 'upload', 'capsulas')
    const [capsule] = await sql`
      INSERT INTO capsules (title, description, audio_url, audio_public_id, duration_seconds, category, language, created_by)
      VALUES (${body.title.trim()}, ${(body.description ?? '').slice(0, 5000)}, ${asset.url},
        ${asset.publicId}, ${asset.durationSeconds ?? Math.round(Number(body.duration || 0))}, ${body.category?.trim() || 'Comunidad'}, ${body.language?.trim() || 'Español'}, ${admin.id})
      RETURNING id
    `
    return { id: capsule.id, message: 'Audio cargado correctamente.' }
  }, { body: t.Object({
    file: t.File({ maxSize: '15m', type: 'audio/*' }), title: t.String(), category: t.Optional(t.String()),
    language: t.Optional(t.String()), duration: t.Optional(t.String()), description: t.Optional(t.String()),
  }) })
  .delete('/audios/:id', async ({ params, headers, set }) => {
    if (!await requireAdmin(headers, set)) return { message: 'Inicia sesión para continuar.' }
    const result = await sql`DELETE FROM capsules WHERE id=${params.id}`
    if (!result.count) { set.status = 404; return { message: 'Cápsula no encontrada.' } }
    return { message: 'Cápsula eliminada.' }
  })
  .post('/bulletins', async ({ body, headers, set }) => {
    const admin = await requireAdmin(headers, set)
    if (!admin) return { message: 'Inicia sesión para continuar.' }
    if (!body.file.type.startsWith('audio/')) { set.status = 400; return { message: 'El boletín debe ser un archivo de audio.' } }
    const asset = await uploadToCloudinary(await body.file.arrayBuffer(), 'video', 'upload', 'boletin')
    const result = await sql.begin(async (tx) => {
      await tx`UPDATE bulletins SET is_active = false WHERE is_active = true`
      return tx`INSERT INTO bulletins (title, publish_date, audio_url, audio_public_id, duration_seconds, is_active, created_by)
        VALUES (${body.title.trim()}, ${body.publishDate}, ${asset.url}, ${asset.publicId}, ${asset.durationSeconds}, true, ${admin.id})
        RETURNING id`
    })
    set.status = 201
    return { id: result[0].id, message: 'Boletín publicado.' }
  }, { body: t.Object({ title: t.String({ minLength: 1, maxLength: 150 }), publishDate: t.String({ format: 'date' }), file: t.File({ maxSize: '15m', type: 'audio/*' }) }) })
  .post('/procedures', async ({ body, headers, set }) => {
    const admin = await requireAdmin(headers, set)
    if (!admin) return { message: 'Inicia sesión para continuar.' }
    const [item] = await sql`INSERT INTO procedures (name, description, requirements, steps, audio_url, audio_public_id, language, is_priority, created_by)
      VALUES (${body.name.trim()}, ${body.description ?? null}, ${body.requirements ?? null}, ${body.steps ?? null}, ${body.audioUrl ?? null},
        ${body.audioPublicId ?? null}, ${body.language ?? 'es'}, ${body.isPriority ?? false}, ${admin.id}) RETURNING id`
    set.status = 201
    return { id: item.id, message: 'Trámite guardado.' }
  }, { body: t.Object({ name: t.String({ minLength: 1, maxLength: 150 }), description: t.Optional(t.String({ maxLength: 5000 })), requirements: t.Optional(t.String({ maxLength: 5000 })), steps: t.Optional(t.String({ maxLength: 5000 })), audioUrl: t.Optional(t.String({ maxLength: 2000 })), audioPublicId: t.Optional(t.String({ maxLength: 255 })), language: t.Optional(t.Union([t.Literal('es'), t.Literal('hn')])), isPriority: t.Optional(t.Boolean()) }) })
  .put('/procedures/:id', async ({ body, params, headers, set }) => {
    if (!await requireAdmin(headers, set)) return { message: 'Inicia sesión para continuar.' }
    const result = await sql`UPDATE procedures SET name=${body.name.trim()}, description=${body.description ?? null},
      requirements=${body.requirements ?? null}, steps=${body.steps ?? null}, audio_url=${body.audioUrl ?? null}, audio_public_id=${body.audioPublicId ?? null},
      language=${body.language ?? 'es'}, is_priority=${body.isPriority ?? false}, updated_at=NOW() WHERE id=${params.id}`
    if (!result.count) { set.status = 404; return { message: 'Trámite no encontrado.' } }
    return { message: 'Trámite actualizado.' }
  }, { body: t.Object({ name: t.String({ minLength: 1, maxLength: 150 }), description: t.Optional(t.String({ maxLength: 5000 })), requirements: t.Optional(t.String({ maxLength: 5000 })), steps: t.Optional(t.String({ maxLength: 5000 })), audioUrl: t.Optional(t.String({ maxLength: 2000 })), audioPublicId: t.Optional(t.String({ maxLength: 255 })), language: t.Optional(t.Union([t.Literal('es'), t.Literal('hn')])), isPriority: t.Optional(t.Boolean()) }) })
  .delete('/procedures/:id', async ({ params, headers, set }) => {
    if (!await requireAdmin(headers, set)) return { message: 'Inicia sesión para continuar.' }
    const result = await sql`DELETE FROM procedures WHERE id=${params.id}`
    if (!result.count) { set.status = 404; return { message: 'Trámite no encontrado.' } }
    return { message: 'Trámite eliminado.' }
  })
