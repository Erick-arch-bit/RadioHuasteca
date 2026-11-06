import { Elysia, t } from 'elysia'
import { getAdmin } from '../auth'
import { sql } from '../db'

const noticeBody = t.Object({
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

function presentNotice(notice: Record<string, unknown>) {
  return {
    ...notice,
    description: notice.summary,
    date: notice.date ?? notice.created_at,
    type: 'community',
    audio: notice.audio_url ? [{ src: notice.audio_url }] : undefined,
  }
}

export const noticeRoutes = new Elysia({ prefix: '/api/notices' })
  .get('/', async () => (await sql`
    SELECT id, title, summary, priority, status, audio_url, audio_public_id,
      image_url, image_public_id, to_char(created_at, 'YYYY-MM-DD') AS date
    FROM notices ORDER BY created_at DESC
  `).map(presentNotice))
  .post('/', async ({ body, headers, set }) => {
    const admin = await getAdmin(headers)
    if (!admin) { set.status = 401; return { message: 'Inicia sesión para continuar.' } }
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
  }, { body: noticeBody })
