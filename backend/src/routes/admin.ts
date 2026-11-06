import { Elysia, t } from 'elysia'
import { destroyCloudinaryAsset, getCloudinaryUrl, renameCloudinaryAsset, uploadToCloudinary } from '../cloudinary'
import { sql } from '../db'
import { clearSessionCookie, getAdmin, signSession } from '../auth'

const noticeSchema = t.Object({
  title: t.String({ minLength: 1, maxLength: 90 }),
  description: t.String({ minLength: 1, maxLength: 2000 }),
  priority: t.Union([t.Literal('urgent'), t.Literal('high'), t.Literal('normal')]),
  type: t.Union([t.Literal('weather'), t.Literal('water'), t.Literal('health'), t.Literal('community')]),
  date: t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
  status: t.Union([t.Literal('active'), t.Literal('scheduled'), t.Literal('resolved')]),
  audioId: t.Optional(t.Union([t.String(), t.Null()])),
  mediaUrl: t.Optional(t.Union([t.String(), t.Null()])),
  mediaPublicId: t.Optional(t.Union([t.String(), t.Null()])),
})

const noticeSelect = sql`
  SELECT n.id, n.audio_id, n.title, n.description, n.priority, n.type,
    to_char(n.notice_date, 'YYYY-MM-DD') AS date, n.status,
    n.media_url AS "mediaUrl", n.media_public_id AS "mediaPublicId",
    a.storage_name AS audio_name, a.mime_type AS audio_mime
  FROM community_notices n
  LEFT JOIN media_audios a ON a.id = n.audio_id
`

function presentNotice(row: Record<string, unknown>) {
  return {
    ...row,
    id: `community-${row.id}`,
    ...(row.audio_name ? { audio: [{ src: `/api/media/${row.audio_name}`, type: row.audio_mime }] } : {}),
  }
}

export const adminRoutes = new Elysia({ prefix: '/api' })
  .post('/auth/login', async ({ body, headers, set }) => {
    const [admin] = await sql`
      SELECT id, username, display_name, role FROM admin_users
      WHERE (lower(username) = lower(${body.username.trim()}) OR lower(email) = lower(${body.username.trim()}))
        AND password_hash = crypt(${body.password}, password_hash)
    `
    if (!admin) {
      set.status = 401
      return { message: 'Usuario o contraseña incorrectos.' }
    }
    const origin = process.env.FRONTEND_ORIGIN
    if (origin && headers.origin && headers.origin !== new URL(origin).origin) {
      set.status = 403
      return { message: 'Origen no autorizado.' }
    }
    set.headers['Set-Cookie'] = `rh_admin=${signSession({ id: Number(admin.id), username: admin.username, displayName: admin.display_name })}; HttpOnly; SameSite=${origin ? 'None' : 'Strict'}; Path=/; Max-Age=28800${process.env.NODE_ENV === 'production' || origin ? '; Secure' : ''}`
    return { user: { id: admin.id, displayName: admin.display_name, role: admin.role } }
  }, {
    body: t.Object({ username: t.String(), password: t.String() }),
  })
  .get('/auth/me', async ({ headers, set }) => {
    const admin = await getAdmin(headers)
    if (!admin) {
      set.status = 401
      return { message: 'Inicia sesión para continuar.' }
    }
    return { user: { id: admin.id, displayName: admin.displayName, role: admin.role } }
  })
  .post('/auth/logout', ({ set }) => {
    set.headers['Set-Cookie'] = clearSessionCookie
    return { ok: true }
  })
  .get('/admin/summary', async ({ headers, set }) => {
    const admin = await getAdmin(headers)
    if (!admin) { set.status = 401; return { message: 'Inicia sesión para continuar.' } }
    return (await sql`SELECT count(*)::int AS procedures, count(*) FILTER (WHERE priority)::int AS priority_procedures FROM procedures`)[0]
  })
  .get('/admin/notices', async ({ headers, set }) => {
    if (!await getAdmin(headers)) { set.status = 401; return { message: 'Inicia sesión para continuar.' } }
    return (await noticeSelect).map(presentNotice)
  })
  .post('/admin/notices', async ({ body, headers, set }) => {
    const admin = await getAdmin(headers)
    if (!admin) { set.status = 401; return { message: 'Inicia sesión para continuar.' } }
    const [notice] = await sql`
      INSERT INTO community_notices (title, description, priority, type, notice_date, status, audio_id, created_by, media_url, media_public_id)
      VALUES (${body.title.trim()}, ${body.description.trim()}, ${body.priority}, ${body.type}, ${body.date}, ${body.status},
        ${body.audioId ? Number(body.audioId) : null}, ${admin.id}, ${body.mediaUrl ?? null}, ${body.mediaPublicId ?? null})
      RETURNING id
    `
    set.status = 201
    return { id: `community-${notice.id}`, message: 'Aviso guardado.' }
  }, { body: noticeSchema })
  .patch('/admin/notices/:id', async ({ body, params, headers, set }) => {
    const admin = await getAdmin(headers)
    if (!admin) { set.status = 401; return { message: 'Inicia sesión para continuar.' } }
    const result = await sql`
      UPDATE community_notices SET title=${body.title.trim()}, description=${body.description.trim()},
        priority=${body.priority}, type=${body.type}, notice_date=${body.date}, status=${body.status},
        audio_id=${body.audioId ? Number(body.audioId) : null}, media_url=${body.mediaUrl ?? null},
        media_public_id=${body.mediaPublicId ?? null}, updated_at=now()
      WHERE id=${params.id.replace('community-', '')}
    `
    if (result.count === 0) { set.status = 404; return { message: 'Aviso no encontrado.' } }
    return { message: 'Aviso actualizado.' }
  }, { body: noticeSchema })
  .post('/audios', async ({ body, headers, set }) => {
    const admin = await getAdmin(headers)
    if (!admin) { set.status = 401; return { message: 'Inicia sesión para continuar.' } }
    if (!body.file.type.startsWith('audio/')) { set.status = 400; return { message: 'Fonoteca solo acepta archivos de audio.' } }
    const asset = await uploadToCloudinary(await body.file.arrayBuffer(), 'video')
    try {
      const [audio] = await sql`
        INSERT INTO media_audios (title, category, language, duration_seconds, description, storage_name, mime_type, file_size, uploaded_by)
        VALUES (${body.title.trim().slice(0,160)}, ${body.category.trim().slice(0,80)}, ${body.language.trim().slice(0,40)},
          ${Math.round(Number(body.duration))}, ${(body.description ?? '').slice(0,2000)}, ${asset.publicId}, ${body.file.type}, ${body.file.size}, ${admin.id})
        RETURNING id
      `
      return { id: audio.id, message: 'Audio cargado correctamente.' }
    } catch (error) {
      await destroyCloudinaryAsset(asset.publicId, 'video', 'upload')
      throw error
    }
  }, { body: t.Object({
    file: t.File({ maxSize: '50m', type: 'audio/*' }), title: t.String(), category: t.String(),
    language: t.String(), duration: t.String(), description: t.Optional(t.String()),
  }) })
  .get('/admin/submissions', async ({ headers, set }) => {
    const admin = await getAdmin(headers)
    if (!admin || !['operator', 'moderator'].includes(admin.role)) { set.status = admin ? 403 : 401; return { message: 'No tienes permisos para moderar.' } }
    return sql`SELECT id, media_type, mime_type, file_size, status, public_title, created_at, reviewed_at FROM citizen_submissions ORDER BY created_at DESC`
  })
  .get('/admin/submissions/:id/media', async ({ headers, params, set }) => {
    const admin = await getAdmin(headers)
    if (!admin || !['operator', 'moderator'].includes(admin.role)) { set.status = admin ? 403 : 401; return { message: 'No tienes permisos para moderar.' } }
    const [asset] = await sql`SELECT storage_name, mime_type FROM citizen_submissions WHERE id=${params.id}`
    if (!asset) { set.status = 404; return { message: 'Medio no encontrado.' } }
    return Response.redirect(getCloudinaryUrl(asset.storage_name, asset.mime_type, { authenticated: true }), 302)
  })
  .patch('/admin/submissions/:id', async ({ body, headers, params, set }) => {
    const admin = await getAdmin(headers)
    if (!admin || !['operator', 'moderator'].includes(admin.role)) { set.status = admin ? 403 : 401; return { message: 'No tienes permisos para moderar.' } }
    if (!['APROBADO', 'RECHAZADO'].includes(body.status)) { set.status = 400; return { message: 'Estado inválido.' } }
    const [asset] = await sql`SELECT status, storage_name, mime_type FROM citizen_submissions WHERE id=${params.id}`
    if (!asset) { set.status = 404; return { message: 'Contenido no encontrado.' } }
    const resourceType = asset.mime_type.startsWith('image/') ? 'image' : 'video'
    if (body.status === 'APROBADO' && asset.status !== 'APROBADO') await renameCloudinaryAsset(asset.storage_name, resourceType, 'authenticated', 'upload')
    await sql.begin(async (transaction) => {
      await transaction`UPDATE citizen_submissions SET status=${body.status}, public_title=${body.status === 'APROBADO' ? (body.title?.trim().slice(0,160) || 'Contenido ciudadano') : null}, reviewed_at=now(), reviewed_by=${admin.id} WHERE id=${params.id}`
      await transaction`INSERT INTO moderation_history (submission_id, previous_status, new_status, changed_by, note) VALUES (${params.id}, ${asset.status}, ${body.status}, ${admin.id}, ${(body.note ?? '').slice(0,500)})`
    })
    return { message: 'Estado actualizado.' }
  }, { body: t.Object({ status: t.String(), title: t.Optional(t.String()), note: t.Optional(t.String()) }) })
  .get('/admin/submissions/:id/history', async ({ headers, params, set }) => {
    const admin = await getAdmin(headers)
    if (!admin || !['operator', 'moderator'].includes(admin.role)) { set.status = admin ? 403 : 401; return { message: 'No tienes permisos para moderar.' } }
    return sql`SELECT h.previous_status, h.new_status, h.note, h.changed_at, COALESCE(u.display_name, 'Sistema') AS changed_by
      FROM moderation_history h LEFT JOIN admin_users u ON u.id=h.changed_by WHERE h.submission_id=${params.id} ORDER BY h.changed_at, h.id`
  })
