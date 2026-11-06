import { Elysia, t } from 'elysia'
import { sql } from '../db'

const noticeBody = t.Object({
  title: t.String({ minLength: 1, maxLength: 90 }),
  description: t.String({ minLength: 1, maxLength: 2000 }),
  priority: t.Union([t.Literal('urgent'), t.Literal('high'), t.Literal('normal')]),
  type: t.Union([t.Literal('weather'), t.Literal('water'), t.Literal('health'), t.Literal('community')]),
  date: t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
  status: t.Union([t.Literal('active'), t.Literal('scheduled'), t.Literal('resolved')]),
  mediaUrl: t.Optional(t.String()),
  mediaPublicId: t.Optional(t.String()),
})

export const noticeRoutes = new Elysia({ prefix: '/api/notices' })
  .get('/', async () => {
    const rows = await sql`
      SELECT id, title, description, priority, type,
        to_char(notice_date, 'YYYY-MM-DD') AS date, status,
        media_url AS "mediaUrl", media_public_id AS "mediaPublicId"
      FROM community_notices
      ORDER BY notice_date DESC, created_at DESC
    `
    return rows.map((notice) => ({
      ...notice,
      id: `community-${notice.id}`,
      ...(notice.mediaUrl ? { audio: [{ src: notice.mediaUrl }] } : {}),
    }))
  })
  .post('/', async ({ body, set }) => {
    const [notice] = await sql`
      INSERT INTO community_notices
        (title, description, priority, type, notice_date, status, media_url, media_public_id)
      VALUES
        (${body.title.trim()}, ${body.description.trim()}, ${body.priority}, ${body.type},
         ${body.date}, ${body.status}, ${body.mediaUrl ?? null}, ${body.mediaPublicId ?? null})
      RETURNING id
    `
    set.status = 201
    return { id: `community-${notice.id}`, message: 'Aviso guardado.' }
  }, { body: noticeBody })
