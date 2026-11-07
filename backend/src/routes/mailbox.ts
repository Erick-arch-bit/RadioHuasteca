import { Elysia, t } from 'elysia'
import { getAdmin } from '../auth'
import { getCloudinaryUrl } from '../cloudinary'
import { sql } from '../db'

const createBody = t.Object({
  messageType: t.String({ minLength: 1, maxLength: 50 }),
  content: t.String({ minLength: 1, maxLength: 5000 }),
  audioUrl: t.Optional(t.Union([t.String({ maxLength: 2000 }), t.Null()])),
  audioPublicId: t.Optional(t.Union([t.String({ maxLength: 255 }), t.Null()])),
  audioMimeType: t.Optional(t.Union([t.String({ maxLength: 100 }), t.Null()])),
  isAnonymous: t.Boolean(),
  senderName: t.Optional(t.String({ maxLength: 100 })),
  senderContact: t.Optional(t.String({ maxLength: 100 })),
})

export const mailboxRoutes = new Elysia({ prefix: '/api/mailbox' })
  .post('/', async ({ body, set }) => {
    const [message] = await sql`INSERT INTO mailbox
      (message_type, content, audio_url, audio_public_id, audio_mime_type, is_anonymous, sender_name, sender_contact)
      VALUES (${body.messageType.trim()}, ${body.content.trim()}, ${body.audioUrl ?? null},
        ${body.audioPublicId ?? null}, ${body.audioMimeType ?? null}, ${body.isAnonymous}, ${body.isAnonymous ? null : body.senderName?.trim() || null},
        ${body.senderContact?.trim() || null}) RETURNING id`
    set.status = 201
    return { id: message.id, message: 'Tu mensaje se envió de forma privada a la radio.' }
  }, { body: createBody })
  .get('/', async ({ headers, query, set }) => {
    if (!await getAdmin(headers)) { set.status = 401; return { message: 'Inicia sesión para continuar.' } }
    const rows = query.type
      ? await sql`SELECT * FROM mailbox WHERE message_type = ${query.type} ORDER BY created_at DESC`
      : await sql`SELECT * FROM mailbox ORDER BY created_at DESC`
    return rows.map((row) => ({ ...row, audio_url: row.audio_public_id && row.audio_mime_type
      ? getCloudinaryUrl(row.audio_public_id, row.audio_mime_type, { authenticated: true }) : null }))
  }, { query: t.Object({ type: t.Optional(t.String({ maxLength: 50 })) }) })
  .patch('/:id/review', async ({ params, headers, set }) => {
    const admin = await getAdmin(headers)
    if (!admin) { set.status = 401; return { message: 'Inicia sesión para continuar.' } }
    const result = await sql`UPDATE mailbox SET status = 'reviewed', reviewed_by = ${admin.id}, reviewed_at = NOW()
      WHERE id = ${params.id} AND status = 'pending'`
    if (result.count === 0) { set.status = 404; return { message: 'Mensaje pendiente no encontrado.' } }
    return { message: 'Mensaje marcado como atendido.' }
  })
