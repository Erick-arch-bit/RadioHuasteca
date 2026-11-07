import { Elysia, t } from 'elysia'
import { getAdmin } from '../auth'
import { sql } from '../db'

const noticeBody = t.Object({
  title: t.String({ minLength: 1, maxLength: 150 }),
  description: t.Optional(t.String({ maxLength: 5000 })),
  summary: t.Optional(t.String({ maxLength: 5000 })),
  category: t.Optional(t.String({ maxLength: 50 })),
  priority: t.Optional(t.String({ maxLength: 20 })),
  mediaUrl: t.Optional(t.Union([t.String(), t.Null()])),
  mediaPublicId: t.Optional(t.Union([t.String(), t.Null()])),
  imageUrl: t.Optional(t.Union([t.String(), t.Null()])),
  imagePublicId: t.Optional(t.Union([t.String(), t.Null()])),
  isAnonymous: t.Optional(t.Boolean()),
})

function presentNotice(notice: Record<string, unknown>) {
  return {
    ...notice,
    description: notice.summary,
    date: notice.date ?? notice.created_at,
    type: notice.category || 'community',
    audio: notice.audio_url ? [{ src: notice.audio_url }] : undefined,
  }
}

export const noticeRoutes = new Elysia({ prefix: '/api/notices' })
  .get('/', async ({ query }) => (await sql`
    SELECT id, title, summary, priority, status, audio_url, audio_public_id,
      image_url, image_public_id, category, is_anonymous,
      to_char(created_at, 'YYYY-MM-DD') AS date
    FROM notices WHERE status = 'active'
      AND (${query.category ?? null}::text IS NULL OR category = ${query.category ?? null})
    ORDER BY created_at DESC
  `).map(presentNotice), { query: t.Object({ category: t.Optional(t.String({ maxLength: 50 })) }) })
  .post('/', async ({ body, set }) => {
    const [notice] = await sql`
      INSERT INTO notices (title, summary, category, priority, status, audio_url, audio_public_id,
        image_url, image_public_id, is_anonymous)
      VALUES (${body.title.trim()}, ${body.summary ?? body.description ?? null}, ${body.category ?? 'community'},
        ${body.priority ?? 'normal'}, 'pending', ${body.mediaUrl ?? null}, ${body.mediaPublicId ?? null},
        ${body.imageUrl ?? null}, ${body.imagePublicId ?? null}, ${body.isAnonymous ?? false})
      RETURNING id
    `
    set.status = 201
    return { id: notice.id, message: 'Aviso enviado para moderación.' }
  }, { body: noticeBody })
  .patch('/:id/moderate', async ({ params, body, headers, set }) => {
    const admin = await getAdmin(headers)
    if (!admin) { set.status = 401; return { message: 'Inicia sesión para continuar.' } }
    const result = await sql`UPDATE notices SET status = ${body.status}, rejection_reason = ${body.reason ?? null},
      moderated_by = ${admin.id}, moderated_at = NOW() WHERE id = ${params.id} AND status = 'pending'`
    if (result.count === 0) { set.status = 404; return { message: 'Aviso pendiente no encontrado.' } }
    return { message: body.status === 'active' ? 'Aviso aprobado y publicado.' : 'Aviso rechazado.' }
  }, { body: t.Object({ status: t.Union([t.Literal('active'), t.Literal('rejected')]), reason: t.Optional(t.String({ maxLength: 1000 })) }) })
